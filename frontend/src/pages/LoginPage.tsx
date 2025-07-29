import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Form, Button, Alert, InputGroup } from "react-bootstrap";
import "../styles/LoginPage.css";
import { MdAccountCircle, MdLock } from "react-icons/md";
import { loginUser } from "../utils/apiClients";
import type { LoginCredentials } from "../utils/apiClients";
import axios from "axios";

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const credentials: LoginCredentials = { email, password };

    try {
      const response = await loginUser(credentials);
      const { token } = response.data;
      localStorage.setItem("token", token);
      navigate("/users");
    } catch (err: unknown) {
      if (err instanceof Error) {
        if (axios.isAxiosError(err)) {
          if (err.response) {
            setError(err.response.data?.message || "Login error");
          } else if (err.request) {
            setError("No response from server");
          } else {
            setError(`Request error: ${err.message}`);
          }
        } else {
          setError(`Error: ${err.message}`);
        }
      } else {
        setError("An unknown error occurred");
        console.error("Unknown error:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="d-flex align-items-center justify-content-center vh-100"
      style={{
        background: "linear-gradient(to right, #4e63d7 0%, #76bfe9 100%)",
      }}
    >
      <div className="container">
        <div className="row">
          <div className="col-md-11 mx-md-auto">
            <div className="login-box bg-white">
              <div className="row no-gutters align-items-center">
                <div className="col-md-6">
                  <div className="form-wrap bg-white">
                    <h4 className="btm-sep pb-3 mb-5">Login</h4>
                    {error && <Alert variant="danger">{error}</Alert>}
                    <Form className="form" onSubmit={handleSubmit}>
                      <div className="row">
                        <div className="col-12">
                          <Form.Group
                            className="mb-3 position-relative"
                            controlId="formBasicEmail"
                          >
                            <InputGroup>
                              <InputGroup.Text
                                style={{
                                  backgroundColor: "#4e63d7",
                                  borderColor: "#4e63d7",
                                  color: "white",
                                  borderRadius: "5px 0 0 5px",
                                  borderRight: "none",
                                }}
                              >
                                <MdAccountCircle
                                  style={{ width: "1.2em", height: "1.2em" }}
                                />
                              </InputGroup.Text>
                              <Form.Control
                                type="email"
                                placeholder="Email Address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                style={{
                                  borderRadius: "0 5px 5px 0",
                                  borderLeft: "none",
                                }}
                              />
                            </InputGroup>
                          </Form.Group>
                        </div>
                        <div className="col-12">
                          <Form.Group
                            className="mb-3 position-relative"
                            controlId="formBasicPassword"
                          >
                            <InputGroup>
                              <InputGroup.Text
                                style={{
                                  backgroundColor: "#4e63d7",
                                  borderColor: "#4e63d7",
                                  color: "white",
                                  borderRadius: "5px 0 0 5px",
                                  borderRight: "none",
                                }}
                              >
                                <MdLock
                                  style={{ width: "1.2em", height: "1.2em" }}
                                />
                              </InputGroup.Text>
                              <Form.Control
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                style={{
                                  borderRadius: "0 5px 5px 0",
                                  borderLeft: "none",
                                }}
                              />
                            </InputGroup>
                          </Form.Group>
                        </div>
                        <div className="col-12 text-lg-end">
                          <Link
                            to="/forgot-password"
                            className="text-primary text-decoration-none"
                          >
                            Forgot password ?
                          </Link>
                        </div>
                        <div className="col-12 mt-4">
                          <Button
                            variant=""
                            type="submit"
                            disabled={loading}
                            id="submit"
                            className="btn btn-lg btn-custom btn-dark btn-block w-100"
                            style={{
                              backgroundColor: "#292b2c",
                              borderColor: "#292b2c",
                              color: "#fff",
                              borderRadius: "5px",
                              padding: "10px 20px",
                              fontSize: "16px",
                              fontWeight: 400,
                              transition: "all .3s ease",
                            }}
                          >
                            {loading ? "Signing in..." : "Sign In"}
                          </Button>
                        </div>
                      </div>
                    </Form>
                  </div>
                </div>
                <div className="col-md-6 d-none d-md-flex align-items-center">
                  <div className="content text-center w-100 px-4">
                    <div className="border-bottom pb-5 mb-5">
                      <h3 className="c-black">First time here?</h3>
                      <Link
                        to="/register"
                        className="btn btn-custom text-decoration-none"
                        style={{
                          backgroundColor: "#4e63d7",
                          borderColor: "#4e63d7",
                          color: "#fff",
                          borderRadius: "5px",
                          padding: "10px 20px",
                          fontSize: "16px",
                          fontWeight: 400,
                          transition: "all .3s ease",
                          display: "inline-block",
                        }}
                      >
                        Sign up
                      </Link>
                    </div>
                    <h5 className="c-black mb-4 mt-n1">Or Sign In With</h5>
                    <div className="socials">
                      <a
                        href="#"
                        className="zmdi zmdi-facebook text-decoration-none mx-1"
                        style={{ fontSize: "24px", color: "#3b5998" }}
                      ></a>
                      <a
                        href="#"
                        className="zmdi zmdi-twitter text-decoration-none mx-1"
                        style={{ fontSize: "24px", color: "#1da1f2" }}
                      ></a>
                      <a
                        href="#"
                        className="zmdi zmdi-google text-decoration-none mx-1"
                        style={{ fontSize: "24px", color: "#db4437" }}
                      ></a>
                      <a
                        href="#"
                        className="zmdi zmdi-instagram text-decoration-none mx-1"
                        style={{ fontSize: "24px", color: "#c13584" }}
                      ></a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
