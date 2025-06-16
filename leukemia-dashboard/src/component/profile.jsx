import { useEffect, useState } from "react";
import { Card } from "../components/ui/card";
import { useParams } from "react-router-dom";
import API from "@/api/axios";

const Profile = () => {
  const { id } = useParams();
  const [user, setUser] = useState({});

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await API.get("auth/users/me/");
        setUser(res.data);
      } catch (error) {
        console.error("Failed to fetch user:", error);
      }
    };

    fetchUser();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-semibold text-primary mb-4">
        User Profile: {id}
      </h1>

      {/* Organization Info */}
      <Card className="p-4 shadow-lg mb-6">
        <h2 className="text-xl font-semibold mb-2">Organization Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="font-medium text-gray-700">Name:</p>
            <p>{user.organization_name || "Not available"}</p>
          </div>
          <div>
            <p className="font-medium text-gray-700">Type:</p>
            <p>{user.organization_type || "Not available"}</p>
          </div>
          <div>
            <p className="font-medium text-gray-700">Address:</p>
            <p>{user.organization_address || "Not available"}</p>
          </div>
          <div>
            <p className="font-medium text-gray-700">Email:</p>
            <p>{user.email || "Not available"}</p>
          </div>
          <div>
            <p className="font-medium text-gray-700">Phone:</p>
            <p>{user.phone || "Not available"}</p>
          </div>
        </div>
      </Card>

      {/* Patient Details */}
      <Card className="p-4 shadow-lg">
        <p>Patient details and test history go here.</p>
      </Card>
    </div>
  );
};

export default Profile;
