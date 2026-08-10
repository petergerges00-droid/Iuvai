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
   * True when the current authentication flow is a
   * Supabase password-recovery flow.
   *
   * IMPORTANT:
   * This remains true until SIGNED_OUT.
   *
   * We deliberately do NOT clear it on USER_UPDATED.
   */
  isPasswordRecovery: boolean;

  /**
   * Re-fetch the currently authenticated user's profile.
   *
   * This is used after onboarding to make sure AuthContext
   * immediately knows that account_type has been saved.
   */
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

  React state updates are asynchronous.

  Supabase may emit several events very quickly:

    PASSWORD_RECOVERY
    INITIAL_SESSION
    USER_UPDATED
    SIGNED_OUT

  This ref gives us an immediate synchronous flag so that
  later events cannot accidentally turn a recovery session
  into a normal login flow.
  */

  const recoveryFlowRef =
    useRef(false);

  /*
  ============================================================
  MOUNT REF
  ============================================================
  */

  const mountedRef =
    useRef(false);

  /*
  ============================================================
  PROFILE REQUEST REF
  ============================================================

  Every profile request receives a unique request number.

  If an older request finishes after a newer request, its
  result is ignored.

  This prevents situations such as:

    onboarding saves profile
          ↓
    refreshProfile()
          ↓
    older getProfile() finishes
          ↓
    stale profile overwrites the new profile
  */

  const profileRequestRef =
    useRef(0);

  /*
  ============================================================
  FETCH PROFILE
  ============================================================
  */

  const fetchProfile = async (
    userId: string
  ): Promise<Profile | null> => {
    const requestId =
      ++profileRequestRef.current;

    try {
      const data =
        await getProfile(userId);

      /*
      Ignore the result if this component has unmounted.
      */
      if (!mountedRef.current) {
        return data;
      }

      /*
      Ignore stale requests.

      Example:

        request 1 starts
        request 2 starts
        request 2 finishes
        request 1 finishes

      Request 1 must not overwrite request 2.
      */
      if (
        requestId !==
        profileRequestRef.current
      ) {
        return data;
      }

      /*
      Make sure the profile still belongs to the
      currently authenticated user.
      */
      if (
        user?.id &&
        user.id !== userId
      ) {
        return data;
      }

      setProfile(data);

      return data;
    } catch (error) {
      console.error(
        'IUVAI ERROR FETCHING PROFILE:',
        error
      );

      if (
        mountedRef.current &&
        requestId ===
          profileRequestRef.current
      ) {
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

    The listener is registered BEFORE getSession().

    This allows us to detect PASSWORD_RECOVERY while the
    recovery URL is being processed.

    IMPORTANT SUPABASE RULE:

    We deliberately do NOT await getProfile() directly inside
    the auth callback.

    Database/auth operations inside onAuthStateChange can
    create timing/deadlock problems.

    Instead, profile loading is scheduled asynchronously.
    */

    const {
      data: {
        subscription,
      },
    } =
      supabase.auth.onAuthStateChange(
        (
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
             * Update React state.
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
             * The recovery page must be allowed to render.
             *
             * We do NOT redirect here.
             */

            if (
              currentSession?.user
            ) {
              /*
               * Defer profile fetching until after the auth
               * callback has returned.
               */
              setTimeout(() => {
                if (
                  mountedRef.current
                ) {
                  fetchProfile(
                    currentSession.user.id
                  );
                }
              }, 0);
            } else {
              setProfile(null);
            }

            setIsLoading(false);

            return;
          }

          /*
          ======================================================
          SIGNED OUT
          ======================================================

          SIGNED_OUT is the event that terminates the recovery
          flow.

          ResetPassword should sign the user out after the
          password has been successfully changed.
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

            profileRequestRef.current++;

            setIsPasswordRecovery(
              false
            );

            setSession(null);
            setUser(null);
            setProfile(null);

            setIsLoading(false);

            return;
          }

          /*
          ======================================================
          RECOVERY SESSION PROTECTION
          ======================================================

          Once PASSWORD_RECOVERY has been detected, subsequent
          events such as INITIAL_SESSION or USER_UPDATED must
          NOT convert the recovery session into a normal login.
          */

          if (
            recoveryFlowRef.current
          ) {
            console.log(
              'IUVAI: RECOVERY FLOW ACTIVE — PRESERVING RECOVERY STATE:',
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
              const recoveryUserId =
                currentSession.user.id;

              setTimeout(() => {
                if (
                  mountedRef.current
                ) {
                  fetchProfile(
                    recoveryUserId
                  );
                }
              }, 0);
            } else {
              setProfile(null);
            }

            setIsLoading(false);

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
           * A normal authentication event is not a recovery
           * flow.
           */
          setIsPasswordRecovery(
            false
          );

          if (
            currentSession?.user
          ) {
            const authenticatedUserId =
              currentSession.user.id;

            /*
             * Defer profile fetching until the Supabase
             * auth callback has completed.
             */
            setTimeout(() => {
              if (
                mountedRef.current
              ) {
                fetchProfile(
                  authenticatedUserId
                );
              }
            }, 0);
          } else {
            profileRequestRef.current++;
            setProfile(null);
          }

          setIsLoading(false);
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

          /*
          ========================================================
          SESSION ERROR
          ========================================================
          */

          if (error) {
            console.error(
              'IUVAI GET SESSION ERROR:',
              error
            );

            recoveryFlowRef.current =
              false;

            setSession(null);
            setUser(null);
            setProfile(null);

            setIsPasswordRecovery(
              false
            );

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

          PASSWORD_RECOVERY may have fired while getSession()
          was running.

          If that happened, recovery state has priority.
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

            setIsPasswordRecovery(
              true
            );

            setIsLoading(false);

            if (
              initialSession?.user
            ) {
              const recoveryUserId =
                initialSession.user.id;

              setTimeout(() => {
                if (
                  mountedRef.current
                ) {
                  fetchProfile(
                    recoveryUserId
                  );
                }
              }, 0);
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

          setIsPasswordRecovery(
            false
          );

          if (
            initialSession?.user
          ) {
            const initialUserId =
              initialSession.user.id;

            /*
             * Fetch the profile after initialization.
             */
            const initialProfile =
              await getProfile(
                initialUserId
              );

            if (
              !mountedRef.current
            ) {
              return;
            }

            /*
             * Do not allow an old initialization request to
             * overwrite the profile of another user.
             */
            if (
              initialUserId !==
              initialSession.user.id
            ) {
              return;
            }

            setProfile(
              initialProfile
            );
          } else {
            profileRequestRef.current++;
            setProfile(null);
          }

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
            recoveryFlowRef.current =
              false;

            profileRequestRef.current++;

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

      profileRequestRef.current++;

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
      /*
       * Always get the current authenticated user directly
       * from the auth state available to this provider.
       */
      if (!user?.id) {
        return;
      }

      console.log(
        'IUVAI: REFRESHING PROFILE:',
        user.id
      );

      /*
       * Wait for the latest profile request to finish.

       * This is important after onboarding:

           upsertProfile()
                  ↓
           upsertExpertProfile()
                  ↓
           refreshProfile()
                  ↓
           AuthContext gets account_type
       */
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
