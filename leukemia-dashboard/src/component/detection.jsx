import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";

const Detection = () => {
  const { id } = useParams();
  const [patientId, setPatientId] = useState(id || "");
  const [patientName, setPatientName] = useState("");
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [results, setResults] = useState([]);
  const [annotatedImages, setAnnotatedImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!patientId) return;

    fetch(`http://127.0.0.1:8000/api/patients/${patientId}/`, {
      headers: {
        Authorization: `Token ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => setPatientName(data.fullname))
      .catch(() => setPatientName("Not found"));
  }, [patientId]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);

    const previews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  const handleDetection = async () => {
    setResults([]);
    setAnnotatedImages([]);

    for (const image of images) {
      const formData = new FormData();
      formData.append("image", image);
      formData.append("patient_id", patientId);

      const res = await fetch("http://127.0.0.1:8000/api/predict/", {
        method: "POST",
        headers: {
          Authorization: `Token ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      const data = await res.json();
      setResults((prev) => [...prev, ...data.results]);
      setAnnotatedImages((prev) => [...prev, data.annotated_image]);
    }
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-3xl font-bold">Leukemia Detection</h1>

      <div className="flex gap-4">
        <div className="w-full">
          <label className="text-sm font-medium">Patient ID</label>
          <Input value={patientId} readOnly className="bg-muted" />
        </div>
        <div className="w-full">
          <label className="text-sm font-medium">Patient Name</label>
          <Input value={patientName} readOnly className="bg-muted" />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Upload Images</label>
        <Input type="file" accept="image/*" multiple onChange={handleImageChange} />
      </div>

      {imagePreviews.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          {imagePreviews.map((src, idx) => (
            <div key={idx} className="border-none rounded p-1">
              <img src={src} alt={`preview-${idx}`} className="h-32 w-full shadow-xl object-cover rounded" />
            </div>
          ))}
        </div>
      )}

      <Button onClick={handleDetection} disabled={images.length === 0}>
        Run Detection
      </Button>

      {annotatedImages.length > 0 && (
        <div className="mt-6">
          <h2 className="font-semibold mb-2 text-center">Detection Results</h2>
          <div className="relative w-fit max-w-xl mx-auto">
            <img
              src={`http://127.0.0.1:8000${annotatedImages[currentIndex]}`}
              alt={`Annotated ${currentIndex}`}
              className="w-full h-140 object-contain rounded border-none shadow-2xl transition duration-300"
            />

            {/* Navigation Arrows */}
            {annotatedImages.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    setCurrentIndex((prev) => (prev === 0 ? annotatedImages.length - 1 : prev - 1))
                  }
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow rounded-full"
                >
                  ←
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    setCurrentIndex((prev) => (prev === annotatedImages.length - 1 ? 0 : prev + 1))
                  }
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow rounded-full"
                >
                  →
                </Button>
              </>
            )}
          </div>
        </div>
      )}

      {results.length > 0 && (
        <div>
          <h2 className="font-semibold mb-2 text-center">Classification Results</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          
          {results.map((res, idx) => (
            <div key={idx} className="border-none shadow-xl p-2 rounded shadow bg-transparent">
              <img
                src={`http://127.0.0.1:8000${res.filename}`}
                className="h-24 w-full object-contain rounded"
              />
              <p className="text-sm text-center mt-1 font-medium">
                {res.label} ({res.confidence})
              </p>
            </div>
          ))}
        </div>
        </div>
      )}
    </div>
  );
};

export default Detection;
