import {
  createContext,
  useContext,
  useEffect,
  useRef,
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

/* ============================================================
   AUTH CONTEXT
   ============================================================ */

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;

  /**
   * True when the current authentication flow
   * is a Supabase password-recovery flow.
   *
   * IMPORTANT:
   * This remains true until SIGNED_OUT.
   *
   * We deliberately do NOT clear it on USER_UPDATED,
   * because USER_UPDATED can occur immediately after
   * the password is changed while the temporary recovery
   * session is still active.
   */
  isPasswordRecovery: boolean;

  refreshProfile: () => Promise<void>;
}

const AuthContext =
  createContext<AuthContextType>({
    session: null,
    user: null,
    profile: null,
    isLoading: true,
    isPasswordRecovery: false,
    refreshProfile: async () => {},
  });

/* ============================================================
   AUTH PROVIDER
   ============================================================ */

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

  const [
    isPasswordRecovery,
    setIsPasswordRecovery,
  ] = useState(false);

  /*
  ============================================================
  RECOVERY FLOW REF
  ============================================================

  A ref is used in addition to React state.

  Why?

  React state updates are asynchronous. During Supabase
  authentication, several events can happen very quickly:

    PASSWORD_RECOVERY
    INITIAL_SESSION
    USER_UPDATED
    SIGNED_OUT

  The ref gives us an immediate, synchronous indication that
  the current authentication flow is a password recovery flow.

  This prevents a later callback from accidentally treating
  the recovery session as a normal login session.
  */

  const recoveryFlowRef =
    useRef(false);

  /*
  ============================================================
  MOUNT REF
  ============================================================
  */

  const mountedRef =
    useRef(true);

  /*
  ============================================================
  FETCH PROFILE
  ============================================================
  */

  const fetchProfile = async (
    userId: string
  ): Promise<Profile | null> => {
    try {
      const data =
        await getProfile(userId);

      if (!mountedRef.current) {
        return data;
      }

      setProfile(data);

      return data;
    } catch (error) {
      console.error(
        'IUVAI ERROR FETCHING PROFILE:',
        error
      );

      if (mountedRef.current) {
        setProfile(null);
      }

      return null;
    }
  };

  /*
  ============================================================
  AUTH INITIALIZATION
  ============================================================
  */

  useEffect(() => {
    mountedRef.current = true;

    /*
    ============================================================
    AUTH STATE LISTENER
    ============================================================
    
    IMPORTANT:

    This listener is registered BEFORE getSession().

    Supabase can emit PASSWORD_RECOVERY while processing the
    recovery URL. We need to be listening before that happens.
    */

    const {
      data: {
        subscription,
      },
    } =
      supabase.auth.onAuthStateChange(
        async (
          event,
          currentSession
        ) => {
          if (
            !mountedRef.current
          ) {
            return;
          }

          console.log(
            'IUVAI SUPABASE AUTH EVENT:',
            event
          );

          /*
          ======================================================
          PASSWORD RECOVERY
          ======================================================
          */

          if (
            event ===
            'PASSWORD_RECOVERY'
          ) {
            console.log(
              'IUVAI: PASSWORD_RECOVERY EVENT DETECTED'
            );

            /*
             * Mark recovery synchronously first.
             */
            recoveryFlowRef.current =
              true;

            /*
             * Then update React state.
             */
            setIsPasswordRecovery(
              true
            );

            setSession(
              currentSession
            );

            setUser(
              currentSession?.user ??
                null
            );

            /*
             * IMPORTANT:
             *
             * We intentionally do NOT redirect here.
             *
             * /reset-password must be allowed to render.
             */

            if (
              currentSession?.user
            ) {
              /*
               * We don't actually need the profile to perform
               * password recovery, but loading it keeps the
               * AuthContext consistent.
               */
              await fetchProfile(
                currentSession.user.id
              );
            } else {
              setProfile(null);
            }

            if (
              mountedRef.current
            ) {
              setIsLoading(false);
            }

            return;
          }

          /*
          ======================================================
          SIGNED OUT
          ======================================================

          This is the ONLY normal authentication event that
          clears the recovery-flow flag.

          ResetPassword intentionally calls:

            supabase.auth.signOut()

          after successfully changing the password.
          */

          if (
            event ===
            'SIGNED_OUT'
          ) {
            console.log(
              'IUVAI: SIGNED_OUT'
            );

            recoveryFlowRef.current =
              false;

            setIsPasswordRecovery(
              false
            );

            setSession(null);
            setUser(null);
            setProfile(null);

            if (
              mountedRef.current
            ) {
              setIsLoading(false);
            }

            return;
          }

          /*
          ======================================================
          RECOVERY SESSION PROTECTION
          ======================================================

          If PASSWORD_RECOVERY has already been detected,
          any subsequent authentication events must NOT turn
          this into a normal authentication flow.

          This is especially important for INITIAL_SESSION
          and USER_UPDATED.
          */

          if (
            recoveryFlowRef.current
          ) {
            console.log(
              'IUVAI: RECOVERY FLOW ACTIVE — PRESERVING RECOVERY STATE',
              event
            );

            setIsPasswordRecovery(
              true
            );

            setSession(
              currentSession
            );

            setUser(
              currentSession?.user ??
                null
            );

            if (
              currentSession?.user
            ) {
              await fetchProfile(
                currentSession.user.id
              );
            } else {
              setProfile(null);
            }

            if (
              mountedRef.current
            ) {
              setIsLoading(false);
            }

            return;
          }

          /*
          ======================================================
          NORMAL AUTHENTICATION
          ======================================================
          */

          console.log(
            'IUVAI: NORMAL AUTH EVENT:',
            event
          );

          setSession(
            currentSession
          );

          setUser(
            currentSession?.user ??
              null
          );

          /*
           * USER_UPDATED is deliberately NOT used to clear
           * password recovery state.
           *
           * In a normal authentication flow, there is no
           * recovery flag anyway.
           */

          if (
            currentSession?.user
          ) {
            await fetchProfile(
              currentSession.user.id
            );
          } else {
            setProfile(null);
          }

          if (
            mountedRef.current
          ) {
            setIsLoading(false);
          }
        }
      );

    /*
    ============================================================
    INITIAL SESSION CHECK
    ============================================================
    */

    const initializeSession =
      async () => {
        try {
          const {
            data: {
              session:
                initialSession,
            },
            error,
          } =
            await supabase.auth.getSession();

          if (
            !mountedRef.current
          ) {
            return;
          }

          if (error) {
            console.error(
              'IUVAI GET SESSION ERROR:',
              error
            );

            setSession(null);
            setUser(null);
            setProfile(null);
            setIsLoading(false);

            return;
          }

          console.log(
            'IUVAI INITIAL SUPABASE SESSION:',
            initialSession
          );

          /*
          ========================================================
          IMPORTANT RECOVERY CHECK
          ========================================================

          If PASSWORD_RECOVERY has already fired while this
          getSession() request was running, preserve recovery
          state.

          Do NOT overwrite it with a normal-session state.
          */

          if (
            recoveryFlowRef.current
          ) {
            console.log(
              'IUVAI INITIAL SESSION: RECOVERY FLOW ALREADY ACTIVE'
            );

            setSession(
              initialSession
            );

            setUser(
              initialSession?.user ??
                null
            );

            if (
              initialSession?.user
            ) {
              await fetchProfile(
                initialSession.user.id
              );
            }

            if (
              mountedRef.current
            ) {
              setIsPasswordRecovery(
                true
              );

              setIsLoading(false);
            }

            return;
          }

          /*
          ========================================================
          NORMAL INITIAL SESSION
          ========================================================
          */

          setSession(
            initialSession
          );

          setUser(
            initialSession?.user ??
              null
          );

          if (
            initialSession?.user
          ) {
            await fetchProfile(
              initialSession.user.id
            );
          } else {
            setProfile(null);
          }

          /*
           * Do not set recovery state here.
           *
           * A normal existing session is NOT a recovery
           * session.
           */
          setIsPasswordRecovery(
            false
          );

          if (
            mountedRef.current
          ) {
            setIsLoading(false);
          }
        } catch (error) {
          console.error(
            'IUVAI INITIAL AUTH ERROR:',
            error
          );

          if (
            mountedRef.current
          ) {
            setSession(null);
            setUser(null);
            setProfile(null);
            setIsPasswordRecovery(
              false
            );
            setIsLoading(false);
          }
        }
      };

    initializeSession();

    /*
    ============================================================
    CLEANUP
    ============================================================
    */

    return () => {
      mountedRef.current = false;

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
      if (!user) {
        return;
      }

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

/* ============================================================
   HOOK
   ============================================================ */

export const useAuth =
  () => useContext(AuthContext);
