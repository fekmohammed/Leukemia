import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ChevronDown, ChevronUp } from "lucide-react";

const formSchema = z.object({
    patientId: z.number().int().min(0).max(999999),
    fullname: z.string().min(2),
    phone: z.string().min(6),
    email: z.string().email(),
    gender: z.enum(["Male", "Female"]),
    age: z.coerce.number().int().min(0).max(120),
    address: z.string().min(2),
    bloodType: z.enum(["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"]),
    medicalConditions: z.string().optional(),
    currentMedications: z.string().optional(),
    emergencyName: z.string().min(2),
    emergencyPhone: z.string().min(6),
});

const AddPatient = ({ patientData = null }) => {
    const [defaultValues, setDefaultValues] = useState(null);
    const navigate = useNavigate();

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues,
    });

    const [showPatientInfo, setShowPatientInfo] = useState(true);
    const [showMedical, setShowMedical] = useState(false);
    const [showEmergency, setShowEmergency] = useState(false);

    useEffect(() => {
        const fetchLatestId = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await fetch("http://localhost:8000/api/patients/", {
                    headers: {
                        Authorization: `Token ${token}`,
                    },
                });
                const data = await response.json();
                const maxId = data.length ? Math.max(...data.map(p => p.id)) : 0;

                setDefaultValues({
                    patientId: maxId + 1,
                    fullname: "",
                    phone: "",
                    email: "",
                    gender: "Male",
                    age: 0,
                    address: "",
                    bloodType: "O+",
                    medicalConditions: "",
                    currentMedications: "",
                    emergencyName: "",
                    emergencyPhone: "",
                });
            } catch (error) {
                console.error("Error fetching patients:", error);
            }
        };

        if (!patientData) {
            fetchLatestId();
        } else {
            setDefaultValues(patientData);
        }
    }, [patientData]);

    useEffect(() => {
        if (defaultValues) {
            form.reset(defaultValues);
        }
    }, [defaultValues]);

    const onSubmit = async (values) => {
        try {
            const token = localStorage.getItem("token");
            const transformed = {
                id: values.patientId,
                fullname: values.fullname,
                phone: values.phone,
                email: values.email,
                gender: values.gender.toLowerCase(),
                age: values.age,
                address: values.address,
                blood_type: values.bloodType,
                medical_conditions: values.medicalConditions || "",
                current_medications: values.currentMedications || "",
                emergency_name: values.emergencyName,
                emergency_phone: values.emergencyPhone,
            };

            const response = await fetch("http://localhost:8000/api/patients/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Token ${token}`,
                },
                body: JSON.stringify(transformed),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("Server error:", errorData);
            } else {
                const data = await response.json();
                console.log("Patient saved:", data);
                navigate("/patients"); // ✅ Redirect after success
            }
        } catch (err) {
            console.error("Error saving patient", err);
        }
    };

    if (!defaultValues) return <div className="p-6">Loading form...</div>;

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 px-6 py-6">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-3xl font-semibold text-primary">Patients</h1>
                    <Button type="submit" disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting ? "Saving..." : "Add Patient"}
                    </Button>
                </div>

                <Section
                    title="Patient Information"
                    open={showPatientInfo}
                    toggle={() => setShowPatientInfo(!showPatientInfo)}
                >
                    <PatientInfo form={form} />
                </Section>

                <Section
                    title="Medical-Related Info"
                    open={showMedical}
                    toggle={() => setShowMedical(!showMedical)}
                >
                    <MedicalInfo form={form} />
                </Section>

                <Section
                    title="Emergency Contact"
                    open={showEmergency}
                    toggle={() => setShowEmergency(!showEmergency)}
                >
                    <EmergencyInfo form={form} />
                </Section>
            </form>
        </Form>
    );
};

const Section = ({ title, open, toggle, children }) => (
    <div className="bg-white rounded-md shadow-md p-6 space-y-4">
        <div onClick={toggle} className="flex justify-between items-center cursor-pointer">
            <h3 className="text-xl font-semibold text-primary">{title}</h3>
            {open ? <ChevronUp /> : <ChevronDown />}
        </div>
        <div
            className={`transition-all duration-300 overflow-hidden ${
                open ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
            }`}
        >
            <div className="mt-4 space-y-4">{children}</div>
        </div>
    </div>
);

const PatientInfo = ({ form }) => (
    <>
        <FormField name="patientId" control={form.control} render={({ field }) => (
            <FormItem>
                <FormLabel>Patient ID</FormLabel>
                <FormControl><Input disabled {...field} /></FormControl>
                <FormMessage />
            </FormItem>
        )} />
        <FormField name="fullname" control={form.control} render={({ field }) => (
            <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
            </FormItem>
        )} />
        <FormField name="phone" control={form.control} render={({ field }) => (
            <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
            </FormItem>
        )} />
        <FormField name="email" control={form.control} render={({ field }) => (
            <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl><Input type="email" {...field} /></FormControl>
                <FormMessage />
            </FormItem>
        )} />
        <FormField name="gender" control={form.control} render={({ field }) => (
            <FormItem>
                <FormLabel>Gender</FormLabel>
                <RadioGroup value={field.value} onValueChange={field.onChange} className="flex space-x-4">
                    <FormItem><RadioGroupItem value="Male" /> Male</FormItem>
                    <FormItem><RadioGroupItem value="Female" /> Female</FormItem>
                </RadioGroup>
                <FormMessage />
            </FormItem>
        )} />
        <FormField name="age" control={form.control} render={({ field }) => (
            <FormItem>
                <FormLabel>Age</FormLabel>
                <FormControl><Input type="number" {...field} /></FormControl>
                <FormMessage />
            </FormItem>
        )} />
        <FormField name="address" control={form.control} render={({ field }) => (
            <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl><Textarea {...field} /></FormControl>
                <FormMessage />
            </FormItem>
        )} />
        <FormField name="bloodType" control={form.control} render={({ field }) => (
            <FormItem>
                <FormLabel>Blood Type</FormLabel>
                <Select value={field.value} onValueChange={field.onChange} >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-white">
                        {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map((type) => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <FormMessage />
            </FormItem>
        )} />
    </>
);

const MedicalInfo = ({ form }) => (
    <>
        <FormField name="medicalConditions" control={form.control} render={({ field }) => (
            <FormItem>
                <FormLabel>Medical Conditions</FormLabel>
                <FormControl><Textarea {...field} /></FormControl>
                <FormMessage />
            </FormItem>
        )} />
        <FormField name="currentMedications" control={form.control} render={({ field }) => (
            <FormItem>
                <FormLabel>Current Medications</FormLabel>
                <FormControl><Textarea {...field} /></FormControl>
                <FormMessage />
            </FormItem>
        )} />
    </>
);

const EmergencyInfo = ({ form }) => (
    <>
        <FormField name="emergencyName" control={form.control} render={({ field }) => (
            <FormItem>
                <FormLabel>Emergency Contact Name</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
            </FormItem>
        )} />
        <FormField name="emergencyPhone" control={form.control} render={({ field }) => (
            <FormItem>
                <FormLabel>Emergency Phone</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
            </FormItem>
        )} />
    </>
);

export default AddPatient;
