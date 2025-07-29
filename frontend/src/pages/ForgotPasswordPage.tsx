import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Form, Button, Alert, Card } from "react-bootstrap";
import axios from "axios";
import { resetPasswordRequest } from "../utils/apiClients";
import type { ResetPasswordRequestData } from "../utils/apiClients";

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const requestData: ResetPasswordRequestData = { email };

    try {
      const response = await resetPasswordRequest(requestData);
      setMessage(response.data.message);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        if (err.response) {
          setMessage(
            err.response.data?.message || "Failed to request password reset."
          );
        } else if (err.request) {
          setMessage("No response from server.");
        } else {
          setMessage(`Request error: ${err.message}`);
        }
      } else {
        setMessage("An unknown error occurred.");
        console.error("Unknown error during password reset request:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <Card className="p-4 shadow" style={{ maxWidth: "400px", width: "100%" }}>
        <h2 className="text-center mb-4">Reset Password</h2>
        {message && (
          <Alert
            variant={
              message.includes("reset") && !message.includes("Error")
                ? "info"
                : "danger"
            }
          >
            {message}
          </Alert>
        )}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="formBasicEmail">
            <Form.Label>Email Address</Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={!!message && !message.includes("Error")}
            />
          </Form.Group>
          <Button
            variant="primary"
            type="submit"
            disabled={loading || (!!message && !message.includes("Error"))}
            className="w-100"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </Button>
        </Form>
        <div className="mt-3 text-center">
          <Link to="/login">Back to Login</Link>
        </div>
      </Card>
    </div>
  );
};

export default ForgotPasswordPage;
