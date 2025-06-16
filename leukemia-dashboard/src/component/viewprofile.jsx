import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
} from "../components/ui/form";
import { Input } from "../components/ui/input";
import { Pencil } from "lucide-react";
import { Trash2 } from "lucide-react";

const ViewProfile = () => {
    const { id } = useParams();
    const [activeTab, setActiveTab] = useState("overview");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [patientData, setPatientData] = useState(null);
    const [profileImageFile, setProfileImageFile] = useState(null);
    const fileInputRef = useRef(null);
    const [reports, setReports] = useState([]);
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportForm, setReportForm] = useState({ title: "", content: "" });
    const [classImages, setClassImages] = useState([]);

    const form = useForm({
        defaultValues: {
            fullname: "",
            age: "",
            gender: "",
            phone: "",
            email: "",
            address: "",
            bloodType: "",
            medicalConditions: "",
            currentMedications: "",
            emergencyName: "",
            emergencyPhone: "",
        },
    });

    const mapBackendToFrontend = (data) => ({
        fullname: data.fullname || "",
        age: data.age?.toString() || "",
        gender: data.gender || "",
        phone: data.phone || "",
        email: data.email || "",
        address: data.address || "",
        bloodType: data.blood_type || "",
        medicalConditions: data.medical_conditions || "",
        currentMedications: data.current_medications || "",
        emergencyName: data.emergency_name || "",
        emergencyPhone: data.emergency_phone || "",
    });

    const mapFrontendToBackend = (data) => ({
        fullname: data.fullname,
        age: parseInt(data.age),
        gender: data.gender,
        phone: data.phone,
        email: data.email,
        address: data.address,
        blood_type: data.bloodType,
        medical_conditions: data.medicalConditions,
        current_medications: data.currentMedications,
        emergency_name: data.emergencyName,
        emergency_phone: data.emergencyPhone,
    });

    useEffect(() => {
        const fetchPatient = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await fetch(`http://localhost:8000/api/patients/${id}/`, {
                    headers: { Authorization: `Token ${token}` },
                });
                if (!response.ok) throw new Error("Failed to fetch patient data");

                const data = await response.json();
                setPatientData(data);
                setReports(data.reports || []);
                form.reset(mapBackendToFrontend(data));
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchPatient();
    }, [id, form]);

    const handleSubmit = form.handleSubmit(async (data) => {
        try {
            const token = localStorage.getItem("token");

            await fetch(`http://localhost:8000/api/patients/${id}/`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Token ${token}`,
                },
                body: JSON.stringify(mapFrontendToBackend(data)),
            });

            if (profileImageFile) {
                const formData = new FormData();
                formData.append("profile_picture", profileImageFile);

                await fetch(`http://localhost:8000/api/patients/${id}/upload_picture/`, {
                    method: "POST",
                    headers: { Authorization: `Token ${token}` },
                    body: formData,
                });
            }

            setIsEditing(false);
            window.location.reload();
        } catch (err) {
            setError(err.message);
        }
    });

    const handleAddReport = async () => {
        const token = localStorage.getItem("token");
        try {
            const response = await fetch("http://localhost:8000/api/reports/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Token ${token}`
                },
                body: JSON.stringify({
                    ...reportForm,
                    patient: id,
                }),
            });

            if (!response.ok) throw new Error("Failed to add report");

            const refreshed = await fetch(`http://localhost:8000/api/patients/${id}/`, {
                headers: { Authorization: `Token ${token}` },
            });
            const data = await refreshed.json();
            setPatientData(data);
            setReports(data.reports || []);
            setShowReportModal(false);
            setReportForm({ title: "", content: "", medication: "" });
        } catch (err) {
            alert(err.message);
        }
    };
    const handleDeleteResult = async (id) => {

        const token = localStorage.getItem("token");

        try {
            const response = await fetch(`http://localhost:8000/api/results/${id}/`, {
                method: "DELETE",
                headers: {
                    Authorization: `Token ${token}`,
                },
            });

            console.log("Delete status:", response.status);

            if (response.status === 204 || response.status === 200) {
                setClassImages((prev) => prev.filter((img) => img.id !== id));
            } else {
                const errorText = await response.text();
                throw new Error(`Failed to delete image: ${response.status} - ${errorText}`);
            }
        } catch (error) {
            console.error("Delete error:", error);
            alert("Failed to delete image");
        }
    };




    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error) return <div className="p-6 text-red-500">Error: {error}</div>;

    const patient = form.getValues();
    const results = patientData?.results || [];
    const annotatedImages = [...new Set(results.map((r) => r.annotated_image).filter(Boolean))];
    const classificationImages = results.filter((r) => r.image);

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-semibold text-primary">Patient Profile</h1>
                <div className="flex gap-2">
                    {!isEditing && (
                        <>
                            <Button variant="outline" onClick={() => setShowReportModal(true)}>
                                Add a Report
                            </Button>
                            <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
                        </>
                    )}
                </div>
            </div>


            <div className="flex gap-6">
                {/* Sidebar */}
                <Card className="w-1/4 p-4 flex flex-col items-center gap-4 bg-[#FFFFFF] border-none h-fit">
                    <div className="relative group">
                        <img
                            src={
                                profileImageFile
                                    ? URL.createObjectURL(profileImageFile)
                                    : patientData?.profile_picture || "/profile.jpg"
                            }
                            alt="Patient"
                            className="w-32 h-32 rounded-full object-cover shadow-md"
                        />
                        {isEditing && (
                            <div
                                onClick={() => fileInputRef.current.click()}
                                className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 rounded-full cursor-pointer"
                            >
                                <Pencil className="text-white w-6 h-6" />
                            </div>
                        )}
                        <input
                            ref={fileInputRef}
                            type="file"
                            className="hidden"
                            onChange={(e) => setProfileImageFile(e.target.files[0])}
                            disabled={!isEditing}
                        />
                    </div>
                    <div className="text-center space-y-1">
                        <p className="font-semibold text-lg">{patient.fullname}</p>
                        <p className="text-sm text-gray-600">{patient.email}</p>
                        <p className="text-sm text-gray-600">{patient.phone}</p>
                    </div>
                    <div className="flex flex-col gap-2 w-full mt-4">
                        {["overview", "medical", "annotated", "classification", "report"].map((tab) => (
                            <Button
                                key={tab}
                                variant={activeTab === tab ? "default" : "outline"}
                                className="capitalize"
                                onClick={() => setActiveTab(tab)}
                            >
                                {tab === "annotated"
                                    ? "Annotated Images"
                                    : tab === "classification"
                                        ? "Classification Results"
                                        : tab === "report"
                                            ? "Report"
                                            : tab}
                            </Button>
                        ))}
                    </div>
                </Card>

                {/* Main Content */}
                <Card className="w-3/4 p-6 bg-[#FFFFFF] border-none">
                    <h2 className="text-2xl font-semibold mb-4 capitalize">{activeTab}</h2>
                    <Form {...form}>
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            {activeTab === "overview" && (
                                <div className="space-y-4">
                                    {["fullname", "age", "gender", "phone", "email", "address", "bloodType", "emergencyName", "emergencyPhone"].map((name) => (
                                        <FormField
                                            key={name}
                                            control={form.control}
                                            name={name}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>{name.replace(/([A-Z])/g, ' $1')}</FormLabel>
                                                    <FormControl><Input {...field} readOnly={!isEditing} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    ))}
                                </div>
                            )}

                            {activeTab === "medical" && (
                                <div className="space-y-4">
                                    {["medicalConditions", "currentMedications"].map((name) => (
                                        <FormField
                                            key={name}
                                            control={form.control}
                                            name={name}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>{name.replace(/([A-Z])/g, ' $1')}</FormLabel>
                                                    <FormControl><Input {...field} readOnly={!isEditing} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    ))}
                                </div>
                            )}

                            {activeTab === "annotated" && (
                                <div className="grid grid-cols-2 gap-4">
                                    {annotatedImages.length === 0 ? (
                                        <p className="text-gray-500">Not implemented yet.</p>
                                    ) : (
                                        annotatedImages.map((imgUrl, index) => (
                                            <div key={index}>
                                                <img
                                                    src={imgUrl}
                                                    alt={`annotated-${index}`}
                                                    className="rounded shadow-md"
                                                />
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}

                            {activeTab === "classification" && (
                                <div className="space-y-6">
                                    {classificationImages.length === 0 ? (
                                        <p className="text-gray-500">Not implemented yet.</p>
                                    ) : (
                                        // Group by date
                                        Object.entries(
                                            classificationImages.reduce((groups, item) => {
                                                const date = new Date(item.uploaded_at).toLocaleDateString();
                                                if (!groups[date]) groups[date] = [];
                                                groups[date].push(item);
                                                return groups;
                                            }, {})
                                        ).map(([date, images]) => (
                                            <div key={date}>
                                                <h2 className="text-lg font-semibold mb-2">{date}</h2>
                                                <div className="grid grid-cols-2 gap-4">
                                                    {images.map((r) => (
                                                        <div key={r.id} className="flex justify-between border-none p-2 rounded-md shadow-xl">
                                                            <img
                                                                src={r.image}
                                                                alt="classification"
                                                                className="rounded shadow-md"
                                                                width={60}
                                                            />
                                                            <div className="space-y-2 px-3 flex flex-col items-center justify-center">
                                                                <p className="text-sm">Label: {r.label}</p>
                                                                <p className="text-sm">Confidence: {(r.confidence * 100).toFixed(2)}%</p>
                                                            </div>
                                                            <button
                                                                onClick={() => handleDeleteResult(r.id)}
                                                                className="text-red-500 hover:text-red-700"
                                                                title="Delete"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}


                            {activeTab === "report" && (
                                <div className="space-y-4">
                                    {reports.length === 0 ? (
                                        <p className="text-gray-500">No reports available.</p>
                                    ) : (
                                        reports.map((report, index) => (
                                            <div key={index} className="border p-4 rounded-md shadow-sm">
                                                <p className="text-sm text-gray-500">{report.date}</p>
                                                <h3 className="text-lg font-semibold">{report.title}</h3>
                                                <p className="text-gray-700 whitespace-pre-line">{report.content}</p>

                                                {/* Conditionally render medication only if it's present and not empty */}
                                                {report.medication && report.medication.trim() !== "N/A" && (
                                                    <p className="text-gray-700 whitespace-pre-line">
                                                        <span className="text-lg font-semibold">Medications: </span>
                                                        {report.medication}
                                                    </p>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}



                            {isEditing && (
                                <div className="flex justify-end gap-2">
                                    <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit">Save Changes</Button>
                                </div>
                            )}
                        </form>
                    </Form>
                </Card>
            </div>

            {/* Report Modal */}
            {showReportModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-6 rounded-md shadow-lg w-full max-w-md">
                        <h2 className="text-xl font-semibold mb-4">Add Report</h2>
                        <div className="space-y-4">
                            <Input
                                placeholder="Report Title"
                                value={reportForm.title}
                                onChange={(e) => setReportForm({ ...reportForm, title: e.target.value })}
                            />
                            <textarea
                                className="w-full border rounded-md p-2"
                                rows={5}
                                placeholder="Report Content"
                                value={reportForm.content}
                                onChange={(e) => setReportForm({ ...reportForm, content: e.target.value })}
                            />
                            <textarea
                                className="w-full border rounded-md p-2"
                                rows={3}
                                placeholder="Medication"
                                value={reportForm.medication}
                                onChange={(e) => setReportForm({ ...reportForm, medication: e.target.value })}
                            />
                        </div>
                        <div className="flex justify-end gap-2 mt-4">
                            <Button variant="outline" onClick={() => setShowReportModal(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleAddReport}>Submit</Button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default ViewProfile;
