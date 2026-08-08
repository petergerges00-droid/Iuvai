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
   * True when the current session was created
   * through Supabase password recovery.
   *
   * This prevents the normal authenticated-user
   * routing from sending the user to onboarding
   * or a dashboard before they reset their password.
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

  const fetchProfile = async (
    userId: string
  ) => {
    try {
      const data = await getProfile(userId);
      setProfile(data);
    } catch (e) {
      console.error(
        'Error fetching profile:',
        e
      );
    }
  };

  useEffect(() => {
    let mounted = true;

    /*
    ============================================================
    INITIAL SESSION
    ============================================================
    */

    supabase.auth
      .getSession()
      .then(
        async ({
          data: { session },
        }) => {
          if (!mounted) return;

          setSession(session);
          setUser(
            session?.user ?? null
          );

          /*
           * IMPORTANT:
           *
           * A password recovery session is normally
           * announced through PASSWORD_RECOVERY in
           * onAuthStateChange.
           *
           * Therefore we do NOT assume that every
           * existing session is a recovery session here.
           */

          if (session?.user) {
            await fetchProfile(
              session.user.id
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
    AUTH STATE LISTENER
    ============================================================
    */

    const {
      data: { subscription },
    } =
      supabase.auth.onAuthStateChange(
        async (
          event,
          session
        ) => {
          if (!mounted) return;

          console.log(
            'SUPABASE AUTH EVENT:',
            event
          );

          setSession(session);
          setUser(
            session?.user ?? null
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

            setIsPasswordRecovery(
              true
            );

            /*
             * Do NOT redirect.
             *
             * The reset-password page needs
             * this temporary authenticated
             * session to call updateUser().
             */

            if (session?.user) {
              await fetchProfile(
                session.user.id
              );
            }

            setIsLoading(false);
            return;
          }

          /*
          ========================================================
          NORMAL AUTH EVENTS
          ========================================================
          */

          if (session?.user) {
            /*
             * If the user has completed the
             * password reset, PASSWORD_RECOVERY
             * is no longer active.
             */
            if (
              event === 'SIGNED_IN' ||
              event === 'USER_UPDATED'
            ) {
              setIsPasswordRecovery(
                false
              );
            }

            await fetchProfile(
              session.user.id
            );
          } else {
            setProfile(null);
            setIsPasswordRecovery(
              false
            );
          }

          setIsLoading(false);
        }
      );

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
