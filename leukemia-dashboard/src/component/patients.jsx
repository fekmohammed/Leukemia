import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getPatients } from "../api/patients.js";
import { Microscope, MoreHorizontal, Eye, Pencil, Trash2 } from "lucide-react";
import axios from "axios";
import { Button } from "../components/ui/button";
import { Table } from "../components/ui/table";
import { Input } from "../components/ui/input";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "../components/ui/popover";

const Patients = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [displayLimit, setDisplayLimit] = useState(10);

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated");
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    getPatients()
      .then((data) => {
        setPatients(data);
      })
      .catch((err) => console.error("Error fetching patients:", err));
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this patient?")) {
      try {
        const token = localStorage.getItem("token"); // or your token key
        await axios.delete(`http://localhost:8000/api/patients/${id}/`, {
          headers: {
            Authorization: `Token ${token}`,
          },
        });
        setPatients((prev) => prev.filter((p) => p.id !== id));
      } catch (error) {
        console.error("Delete failed:", error);
      }
    }
  };

  const handleSort = (field) => {
    const isAsc = sortField === field && sortOrder === "asc";
    setSortField(field);
    setSortOrder(isAsc ? "desc" : "asc");
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return null;
    return sortOrder === "asc" ? "↑" : "↓";
  };

  const getFilteredPatients = () => {
    let filtered = patients.filter((p) =>
      p.fullname.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (sortField) {
      filtered.sort((a, b) => {
        const valA = a[sortField]?.toString().toLowerCase() || "";
        const valB = b[sortField]?.toString().toLowerCase() || "";
        if (valA < valB) return sortOrder === "asc" ? -1 : 1;
        if (valA > valB) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
    }

    if (displayLimit !== "All") {
      return filtered.slice(0, displayLimit);
    }

    return filtered;
  };

  const filteredPatients = getFilteredPatients();

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-semibold text-primary">Patients</h1>
        <Link to="/add">
          <Button>+ Add New Patient</Button>
        </Link>
      </div>

      {/* Search and Display Controls */}
      <div className="flex justify-between items-center gap-4 mb-6">
        <Input
          placeholder="Search by name..."
          className="w-100 bg-[#FFFFFF] border-none shadow-md focus:ring-2 focus:ring-primary"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className="flex gap-2 bg-[#F7F7F7] px-1 py-1 rounded-md">
          {[10, 20, "All"].map((limit) => (
            <Button
              key={limit}
              className={`w-12 h-10 p-0 rounded-md text-gray transition-all duration-700 ${
                displayLimit === limit
                  ? "bg-white border border-gray-300"
                  : "bg-[#F7F7F7] border border-transparent hover:border-gray-200"
              }`}
              onClick={() =>
                setDisplayLimit(limit === "All" ? "All" : parseInt(limit))
              }
            >
              {limit}
            </Button>
          ))}
        </div>
      </div>

      {/* Table */}
      <Table className={"bg-[#FFFFFF] rounded-md shadow-md min-w-full divide-y divide-gray-200"}>
        <thead className="bg-gray-100">
          <tr className="bg-muted">
            <th
              className="text-left px-4 py-2 cursor-pointer"
              onClick={() => handleSort("id")}
            >
              Patient ID {getSortIcon("id")}
            </th>
            <th
              className="text-left px-4 py-2 cursor-pointer"
              onClick={() => handleSort("fullname")}
            >
              Name {getSortIcon("fullname")}
            </th>
            <th
              className="text-left px-4 py-2 cursor-pointer"
              onClick={() => handleSort("phone")}
            >
              Phone {getSortIcon("phone")}
            </th>
            <th
              className="text-left px-4 py-2 cursor-pointer"
              onClick={() => handleSort("gender")}
            >
              Gender {getSortIcon("gender")}
            </th>
            <th className="text-left px-4 py-2">Action</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filteredPatients.map((p) => (
            <tr key={p.id} className="border-t">
              <td className="px-4 py-2">{p.id}</td>
              <td className="px-4 py-2">{p.fullname}</td>
              <td className="px-4 py-2">{p.phone}</td>
              <td className="px-4 py-2">{p.gender}</td>
              <td className="px-4 py-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-48 p-2 bg-white text-black">
                    <div className="flex flex-col space-y-1">
                      <Link
                        to={`/detect/${p.id}`}
                        className="flex items-center px-2 py-2 text-sm hover:bg-[#F7F7F7] rounded transition-all duration-300"
                      >
                        <Microscope className="w-4 h-4 mr-2" />
                        Leukemia Detection
                      </Link>

                      <Link
                        to={`/patients/${p.id}/profile`}
                        className="flex items-center px-2 py-2 text-sm hover:bg-[#F7F7F7] rounded transition-all duration-300"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Profile
                      </Link>

                      <Link
                        to={`/edit/${p.id}`}
                        className="flex items-center px-2 py-2 text-sm hover:bg-[#F7F7F7] rounded transition-all duration-300"
                      >
                        <Pencil className="w-4 h-4 mr-2" />
                        Edit
                      </Link>

                      <div className="border-t my-1"></div>

                      <button
                        onClick={() => handleDelete(p.id)}
                        className="flex items-center px-2 py-2 text-sm text-red-600 hover:bg-red-100 transition-all duration-300 rounded"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </button>
                    </div>
                  </PopoverContent>
                </Popover>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default Patients;
