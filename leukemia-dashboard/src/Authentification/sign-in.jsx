import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import API from "@/api/axios";
import { useEffect, useState } from "react";
const SignIn = ({ setAuthenticated }) => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await API.post("auth/token/login/", {
                email,
                password,
            });

            const token = response.data.auth_token || response.data.token;

            // ✅ Set token in localStorage
            localStorage.setItem("token", token);

            // ✅ Ensure Axios uses it immediately for future requests
            API.defaults.headers.common["Authorization"] = `Token ${token}`;

            // ✅ Wait for a short moment to ensure it's visible to the interceptor (optional but safer)
            await new Promise((resolve) => setTimeout(resolve, 50));

            // ✅ Fetch user info
            const userResponse = await API.get("auth/users/me/");
            localStorage.setItem("user", JSON.stringify(userResponse.data));

            localStorage.setItem("isAuthenticated", "true");
            setAuthenticated(true);

            navigate("/");
        } catch (error) {
            console.error("Login failed:", error);
            alert("Invalid credentials");
        }
    };



    const handleGoogleSignIn = () => {
        alert("Google Sign-In clicked");
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <Card className="w-full max-w-md shadow-2xl p-6 bg-[#FFFFFF] border-none">
                <CardContent>
                    <h2 className="text-2xl font-bold mb-4 text-center">Sign In</h2>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <Input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <Input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        {/* <div className="text-right text-sm">
                            <Link to="/forgot-password" className="text-blue-600 hover:underline">
                                Forgot password?
                            </Link>
                            <p className="text-sm text-center mt-4">
                                Don’t have an account?{" "}
                                <Link to="/register" className="text-blue-500 hover:underline">
                                    Create one
                                </Link>
                            </p>
                        </div> */}

                        <Button type="submit" className="w-full">Sign In</Button>

                        {/* <div className="flex items-center justify-center my-2 text-gray-500 text-sm">or</div>

                        <Button type="button" variant="outline" className="w-full" onClick={handleGoogleSignIn}>
                            Continue with Google
                        </Button> */}
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default SignIn;
