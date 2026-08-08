import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';

import {
  Session,
  User,
} from '@supabase/supabase-js';

import {
  supabase,
  Profile,
  getProfile,
} from '@/lib/supabase';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;

  /**
   * True when the current authentication flow
   * was initiated through Supabase password recovery.
   *
   * This prevents normal authenticated routing
   * from sending the user to onboarding/dashboard
   * before they reset their password.
   */
  isPasswordRecovery: boolean;

  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  profile: null,
  isLoading: true,
  isPasswordRecovery: false,
  refreshProfile: async () => {},
});

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [session, setSession] =
    useState<Session | null>(null);

  const [user, setUser] =
    useState<User | null>(null);

  const [profile, setProfile] =
    useState<Profile | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const [isPasswordRecovery, setIsPasswordRecovery] =
    useState(false);

  /*
  ============================================================
  FETCH PROFILE
  ============================================================
  */

  const fetchProfile = async (
    userId: string
  ) => {
    try {
      const data = await getProfile(userId);
      setProfile(data);
      return data;
    } catch (error) {
      console.error(
        'ERROR FETCHING PROFILE:',
        error
      );

      setProfile(null);
      return null;
    }
  };

  /*
  ============================================================
  AUTH INITIALIZATION
  ============================================================
  */

  useEffect(() => {
    let mounted = true;

    /*
    ------------------------------------------------------------
    AUTH STATE LISTENER
    ------------------------------------------------------------

    Set up the listener BEFORE getSession().

    This is important for password recovery because
    Supabase can emit PASSWORD_RECOVERY while the
    recovery URL is being processed.
    */

    const {
      data: { subscription },
    } =
      supabase.auth.onAuthStateChange(
        async (
          event,
          currentSession
        ) => {
          if (!mounted) return;

          console.log(
            'SUPABASE AUTH EVENT:',
            event
          );

          /*
          ========================================================
          PASSWORD RECOVERY
          ========================================================
          */

          if (
            event ===
            'PASSWORD_RECOVERY'
          ) {
            console.log(
              'PASSWORD RECOVERY SESSION DETECTED'
            );

            setIsPasswordRecovery(true);

            setSession(
              currentSession
            );

            setUser(
              currentSession?.user ?? null
            );

            /*
             * We intentionally do NOT redirect.
             *
             * The reset-password page needs the
             * recovery session to call:
             *
             * supabase.auth.updateUser(...)
             */

            if (
              currentSession?.user
            ) {
              await fetchProfile(
                currentSession.user.id
              );
            }

            if (mounted) {
              setIsLoading(false);
            }

            return;
          }

          /*
          ========================================================
          SIGNED OUT
          ========================================================
          */

          if (
            event ===
            'SIGNED_OUT'
          ) {
            setSession(null);
            setUser(null);
            setProfile(null);
            setIsPasswordRecovery(false);
            setIsLoading(false);

            return;
          }

          /*
          ========================================================
          NORMAL AUTHENTICATED SESSION
          ========================================================
          */

          setSession(
            currentSession
          );

          setUser(
            currentSession?.user ?? null
          );

          if (
            currentSession?.user
          ) {
            /*
             * USER_UPDATED can occur after the
             * password has been successfully changed.
             *
             * At that point the recovery flow is
             * considered complete.
             */

            if (
              event ===
              'USER_UPDATED'
            ) {
              setIsPasswordRecovery(
                false
              );
            }

            await fetchProfile(
              currentSession.user.id
            );
          } else {
            setProfile(null);
            setIsPasswordRecovery(
              false
            );
          }

          if (mounted) {
            setIsLoading(false);
          }
        }
      );

    /*
    ============================================================
    INITIAL SESSION CHECK
    ============================================================
    */

    supabase.auth
      .getSession()
      .then(
        async ({
          data: {
            session: initialSession,
          },
        }) => {
          if (!mounted) return;

          console.log(
            'INITIAL SUPABASE SESSION:',
            initialSession
          );

          /*
           * Do not automatically mark this as
           * password recovery.
           *
           * The PASSWORD_RECOVERY event is the
           * authoritative signal for that flow.
           */

          setSession(
            initialSession
          );

          setUser(
            initialSession?.user ?? null
          );

          if (
            initialSession?.user
          ) {
            await fetchProfile(
              initialSession.user.id
            );
          }

          if (mounted) {
            setIsLoading(false);
          }
        }
      )
      .catch((error) => {
        console.error(
          'GET SESSION ERROR:',
          error
        );

        if (mounted) {
          setIsLoading(false);
        }
      });

    /*
    ============================================================
    CLEANUP
    ============================================================
    */

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  /*
  ============================================================
  REFRESH PROFILE
  ============================================================
  */

  const refreshProfile =
    async () => {
      if (!user) return;

      await fetchProfile(
        user.id
      );
    };

  /*
  ============================================================
  PROVIDER
  ============================================================
  */

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        isLoading,
        isPasswordRecovery,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth =
  () => useContext(AuthContext);
