import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Dummy patient data
const recentPatients = [
  { id: 1, name: "John Doe", date: "2025-06-10", result: "AML" },
  { id: 2, name: "Alice Smith", date: "2025-06-09", result: "ALL" },
  { id: 3, name: "Bob Johnson", date: "2025-06-09", result: "CLL" },
  { id: 4, name: "Emma Brown", date: "2025-06-08", result: "CML" },
];

// Dummy chart data
const chartData = [
  { type: "AML", count: 25 },
  { type: "ALL", count: 20 },
  { type: "CLL", count: 15 },
  { type: "CML", count: 40 },
];

const Dashboard = () => {
  return (
    <div className="p-6 space-y-10">
      <h1 className="text-3xl font-semibold text-primary">Dashboard</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardContent>
            <p className="text-sm text-muted-foreground">Total Patients</p>
            <h2 className="text-2xl font-bold">120</h2>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-sm text-muted-foreground">New Detections Today</p>
            <h2 className="text-2xl font-bold">8</h2>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-sm text-muted-foreground">Classified Cells</p>
            <h2 className="text-2xl font-bold">3,200</h2>
          </CardContent>
        </Card>
        {/* <Card>
          <CardContent>
            <p className="text-sm text-muted-foreground">Detection Accuracy</p>
            <h2 className="text-2xl font-bold">94.5%</h2>
          </CardContent>
        </Card> */}
      </div>

      {/* Chart + Table side-by-side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Recent Patients Table */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Recent Patients</h2>
          <div className="bg-white shadow-md rounded-lg overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Detection Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Result
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentPatients.map((patient) => (
                  <tr key={patient.id}>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                      {patient.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {patient.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {patient.result}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {/* Chart */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Detection Summary by Type For 2025</h2>
          <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        
      </div>
    </div>
  );
};

export default Dashboard;
