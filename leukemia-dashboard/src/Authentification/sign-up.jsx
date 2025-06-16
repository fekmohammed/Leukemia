import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import API from "@/api/axios";
import { useEffect, useState } from "react";

const SignUp = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [fullName, setFullName] = useState("");

    const handleRegister = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        try {
            await API.post("register/", {
                email,
                password,
                name: fullName,
            });

            alert("Registered successfully!");
            navigate("/login");
        } catch (error) {
            console.error("Registration failed:", error);
            alert("Something went wrong");
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <Card className="w-full max-w-md shadow-2xl p-6 bg-[#FFFFFF] border-none">
                <CardContent>
                    <h2 className="text-2xl font-bold mb-4 text-center">Create an Account</h2>
                    <form onSubmit={handleRegister} className="space-y-4">
                        <Input
                            type="text"
                            placeholder="Full Name"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                        />
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
                        <Input
                            type="password"
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                        <Button type="submit" className="w-full">Register</Button>

                        <p className="text-sm text-center mt-4">
                            Already have an account?{" "}
                            <Link to="/login" className="text-blue-500 hover:underline">
                                Sign in
                            </Link>
                        </p>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default SignUp;
