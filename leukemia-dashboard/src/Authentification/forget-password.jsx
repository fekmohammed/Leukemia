import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const ForgetPassword = () => {
    const [email, setEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Sending password reset to:", email);
        setSubmitted(true);
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <Card className="w-full max-w-md shadow-2xl p-6 bg-[#FFFFFF] border-none">
                <CardContent>
                    <h2 className="text-2xl font-bold mb-4 text-center">Forgot your password?</h2>
                    <p className="text-sm text-gray-600 mb-6 text-center">
                        Enter your email and we’ll send you a reset link.
                    </p>

                    {submitted ? (
                        <div className="text-green-600 font-medium text-center">
                            A reset link has been sent to <strong>{email}</strong>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <Input
                                type="email"
                                value={email}
                                required
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                            />
                            <Button type="submit" className="w-full">
                                Send Reset Link
                            </Button>
                        </form>
                    )}

                    <div className="mt-6 text-center">
                        <Link to="/login" className="text-blue-600 hover:underline text-sm">
                            Back to login
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default ForgetPassword;
