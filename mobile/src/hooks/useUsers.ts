// src/hooks/useUsers.ts

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { useAuth } from "@/src/contexts/AuthContext";

import {
  UserUpdate,
  UserRead,
} from "@/src/types/api";

import {
  getUser,
  updateUser,
  deleteAccount,
} from "@/src/services/user.service";

import {
  queryKeys,
} from "@/src/config/queryClient";


/* -------------------------------------------------------------------------- */
/*                                  Get User                                  */
/* -------------------------------------------------------------------------- */

export const useUser = () => {
  const { user } = useAuth();

  return useQuery<
    UserRead,
    Error
  >({
    queryKey:
      queryKeys.user.profile(),

    queryFn: async () => {
      if (!user) {
        throw new Error(
          "User is not authenticated"
        );
      }

      return getUser(user);
    },

    enabled: !!user,
  });
};


/* -------------------------------------------------------------------------- */
/*                                Update User                                 */
/* -------------------------------------------------------------------------- */

export const useUpdateUser = () => {
  const { user } =
    useAuth();

  const queryClient =
    useQueryClient();

  return useMutation<
    UserRead,
    Error,
    UserUpdate
  >({
    mutationFn: async (
      data: UserUpdate
    ) => {
      if (!user) {
        throw new Error(
          "User is not authenticated"
        );
      }

      return updateUser(
        user,
        data
      );
    },

    retry: false,

    onSuccess: (
      updatedUser
    ) => {
      /*
       * Immediately update the cached
       * backend user.
       *
       * Profile screen updates instantly
       * without another GET request.
       */
      queryClient.setQueryData(
        queryKeys.user.profile(),
        updatedUser
      );

      /*
       * Currency changes may affect data
       * displayed throughout the app.
       */
      queryClient.invalidateQueries({
        queryKey:
          queryKeys.expenses.all,
      });

      queryClient.invalidateQueries({
        queryKey:
          queryKeys.ledgers.all,
      });
    },
  });
};


/* -------------------------------------------------------------------------- */
/*                                Delete User                                 */
/* -------------------------------------------------------------------------- */

export const useDeleteUser = () => {
  const { user } =
    useAuth();

  const queryClient =
    useQueryClient();

  return useMutation<
    void,
    Error,
    void
  >({
    mutationFn: async () => {
      if (!user) {
        throw new Error(
          "User is not authenticated"
        );
      }

      await deleteAccount(
        user
      );
    },

    retry: false,

    onSuccess: () => {
      queryClient.clear();
    },
  });
};