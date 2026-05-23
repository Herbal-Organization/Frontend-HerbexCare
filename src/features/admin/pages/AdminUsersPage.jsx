import { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { FiDatabase } from "react-icons/fi";
import { registerAccount } from "@api/accounts";
import { deleteUser, getAllUsers, getUserById, updateUser } from "@api/users";
import AdminUsersHeader from "@features/admin/components/users/AdminUsersHeader";
import AdminUsersHero from "@features/admin/components/users/AdminUsersHero";
import AdminUsersStats from "@features/admin/components/users/AdminUsersStats";
import AdminUsersToolbar from "@features/admin/components/users/AdminUsersToolbar";
import AdminUsersTable from "@features/admin/components/users/AdminUsersTable";
import AdminUserDetailsDrawer from "@features/admin/components/users/AdminUserDetailsDrawer";
import AdminDeleteUserModal from "@features/admin/components/users/AdminDeleteUserModal";
import AdminUserModal from "@features/admin/components/users/AdminUserModal";
import AdminPagination from "@features/admin/components/users/AdminPagination";
import {
  filterUsersByRole,
  getAdminUserStats,
  matchesUserSearch,
  normalizeAdminUser,
  normalizeUsersResponse,
} from "@features/admin/services/adminUsers";

const PAGE_SIZE = 10;
const LOAD_SIZE = 1000;

function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [detailUser, setDetailUser] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [modalUser, setModalUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [modalError, setModalError] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadUsers = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await getAllUsers({
        PageNumber: 1,
        PageSize: LOAD_SIZE,
      });
      const normalized = normalizeUsersResponse(response);
      setUsers(normalized.items);
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.title ||
        "Unable to load admin users.";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchValue, roleFilter]);

  const filteredUsers = useMemo(() => {
    return filterUsersByRole(
      users.filter((user) => matchesUserSearch(user, searchValue)),
      roleFilter,
    );
  }, [roleFilter, searchValue, users]);

  const totalItems = filteredUsers.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const stats = useMemo(() => getAdminUserStats(users), [users]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handleOpenCreate = () => {
    setModalMode("create");
    setModalUser(null);
    setModalError("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user) => {
    setModalMode("edit");
    setModalUser(user);
    setModalError("");
    setIsModalOpen(true);
  };

  const handleDeleteUser = async (user) => {
    if (!user?.id) return;

    setDeleteTarget(user);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    if (isDeleting) return;

    setIsDeleteModalOpen(false);
    setDeleteTarget(null);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget?.id) return;

    setIsDeleting(true);

    try {
      await deleteUser(deleteTarget.id);
      toast.success("User deleted successfully.");

      if (detailUser?.id === deleteTarget.id) {
        setIsDetailOpen(false);
        setDetailUser(null);
      }

      if (modalUser?.id === deleteTarget.id) {
        setIsModalOpen(false);
        setModalUser(null);
      }

      setIsDeleteModalOpen(false);
      setDeleteTarget(null);
      await loadUsers();
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.title ||
        "Unable to delete user.";
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleViewUser = async (user) => {
    setIsDetailOpen(true);
    setIsDetailLoading(true);
    setDetailUser(user);

    try {
      const response = await getUserById(user.id);
      setDetailUser(normalizeAdminUser(response));
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          err?.response?.data?.title ||
          "Unable to load user details.",
      );
    } finally {
      setIsDetailLoading(false);
    }
  };

  const handleSubmitUser = async (payload) => {
    setModalError("");
    setIsSaving(true);

    try {
      if (modalMode === "edit" && modalUser?.id) {
        await updateUser(modalUser.id, payload);
        toast.success("User updated successfully.");
      } else {
        await registerAccount(payload);
        toast.success("User created successfully.");
      }

      setIsModalOpen(false);
      setModalUser(null);
      await loadUsers();
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.title ||
        "Unable to save user.";
      setModalError(message);
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-8">
      <div className="space-y-5">
        <AdminUsersHeader
          searchValue={searchValue}
          onSearchChange={setSearchValue}
        />

        <AdminUsersHero
          onAddUser={handleOpenCreate}
          totalUsers={users.length}
        />

        <AdminUsersStats stats={stats} />

        <AdminUsersToolbar
          totalItems={totalItems}
          roleFilter={roleFilter}
          onRoleFilterChange={setRoleFilter}
        />

        {isLoading ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-500" />
            <p className="mt-4 text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">
              Loading users
            </p>
          </div>
        ) : null}

        {!isLoading && error ? (
          <div className="rounded-3xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
            {error}
          </div>
        ) : null}

        {!isLoading && !error && paginatedUsers.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-14 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
              <FiDatabase className="text-2xl" />
            </div>
            <h2 className="mt-5 text-2xl font-black text-slate-900">
              No users found
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Try a different search term or role filter.
            </p>
          </div>
        ) : null}

        {!isLoading && !error && paginatedUsers.length > 0 ? (
          <AdminUsersTable
            users={paginatedUsers}
            onView={handleViewUser}
            onEdit={handleOpenEdit}
            onDelete={handleDeleteUser}
          />
        ) : null}

        {!isLoading && !error ? (
          <AdminPagination
            totalItems={totalItems}
            itemsPerPage={PAGE_SIZE}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
        ) : null}
      </div>

      <AdminUserDetailsDrawer
        user={detailUser}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        loading={isDetailLoading}
      />

      <AdminUserModal
        key={`${modalMode}-${modalUser?.id || "new"}-${isModalOpen ? "open" : "closed"}`}
        isOpen={isModalOpen}
        mode={modalMode}
        initialValue={modalUser}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitUser}
        isSubmitting={isSaving}
        error={modalError}
      />

      <AdminDeleteUserModal
        isOpen={isDeleteModalOpen}
        user={deleteTarget}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}

export default AdminUsersPage;
