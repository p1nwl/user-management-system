import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Table, Container, Alert, Form, Button } from "react-bootstrap";
import axios from "axios";
import type { AxiosResponse } from "axios";
import Toolbar from "../components/Toolbar";
import {
  fetchUsers,
  blockUsers,
  unblockUsers,
  deleteUsers,
} from "../utils/apiClients";
import type { User, ApiSuccessResponse } from "../utils/apiClients";

const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const loadUsers = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchUsers();
      setUsers(response.data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        if (axios.isAxiosError(err)) {
          if (err.response) {
            if (err.response.status === 401 || err.response.status === 403) {
              localStorage.removeItem("token");
              navigate("/login", {
                state: { message: "Please log in again." },
              });
            } else {
              setError(err.response.data?.message || "Failed to load users.");
            }
          } else if (err.request) {
            setError("No response from server.");
          } else {
            setError(`Request error: ${err.message}`);
          }
        } else {
          setError(`Error: ${err.message}`);
        }
      } else {
        setError("An unknown error occurred.");
        console.error("Unknown error during user fetch:", err);
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleSelectAllChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const allUserIds = users.map((user) => user.id);
      setSelectedUserIds(allUserIds);
    } else {
      setSelectedUserIds([]);
    }
  };

  const handleUserSelectChange = (userId: number, isChecked: boolean) => {
    if (isChecked) {
      setSelectedUserIds((prev) => [...prev, userId]);
    } else {
      setSelectedUserIds((prev) => prev.filter((id) => id !== userId));
    }
  };

  const performAction = async (
    actionFunction: (
      ids: number[]
    ) => Promise<AxiosResponse<ApiSuccessResponse>>,
    actionName: string
  ) => {
    if (selectedUserIds.length === 0) return;

    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      await actionFunction(selectedUserIds);
      setSuccessMessage(`${actionName} action completed successfully`);
      setSelectedUserIds([]);
      await loadUsers();
    } catch (err: unknown) {
      if (err instanceof Error) {
        if (axios.isAxiosError(err)) {
          if (err.response) {
            if (err.response.status === 401 || err.response.status === 403) {
              localStorage.removeItem("token");
              navigate("/login", {
                state: { message: "Session expired. Please log in again." },
              });
            } else {
              setError(
                err.response.data?.message ||
                  `Failed to ${actionName.toLowerCase()} users.`
              );
            }
          } else if (err.request) {
            setError("No response from server.");
          } else {
            setError(`Request error: ${err.message}`);
          }
        } else {
          setError(`Error: ${err.message}`);
        }
      } else {
        setError("An unknown error occurred.");
        console.error(`Unknown error during ${actionName.toLowerCase()}:`, err);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBlockSelected = () => performAction(blockUsers, "Block");
  const handleUnblockSelected = () => performAction(unblockUsers, "Unblock");
  const handleDeleteSelected = () => performAction(deleteUsers, "Delete");

  const isAllSelected =
    users.length > 0 && selectedUserIds.length === users.length;

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">User Management</h2>
        <Button variant="outline-secondary" onClick={handleLogout}>
          Logout
        </Button>
      </div>
      {error && <Alert variant="danger">{error}</Alert>}
      {successMessage && <Alert variant="success">{successMessage}</Alert>}
      <Toolbar
        selectedCount={selectedUserIds.length}
        onBlock={handleBlockSelected}
        onUnblock={handleUnblockSelected}
        onDelete={handleDeleteSelected}
        disabled={loading}
      />
      {loading ? (
        <p>Loading users...</p>
      ) : (
        <div className="table-responsive">
          <Table striped bordered hover>
            <thead>
              <tr>
                <th style={{ width: "50px" }}>
                  <Form.Check
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={handleSelectAllChange}
                    aria-label="Select all users"
                  />
                </th>
                <th>Name</th>
                <th>Email</th>
                <th>Last Login</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <Form.Check
                        type="checkbox"
                        checked={selectedUserIds.includes(user.id)}
                        onChange={(e) =>
                          handleUserSelectChange(user.id, e.target.checked)
                        }
                        aria-label={`Select user ${user.name}`}
                      />
                    </td>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      {user.last_login
                        ? new Date(user.last_login).toLocaleString()
                        : "Never"}
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          user.status === "active"
                            ? "bg-success"
                            : user.status === "blocked"
                            ? "bg-warning text-dark"
                            : "bg-secondary"
                        }`}
                      >
                        {user.status.charAt(0).toUpperCase() +
                          user.status.slice(1)}{" "}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      )}
    </Container>
  );
};

export default UserManagementPage;
