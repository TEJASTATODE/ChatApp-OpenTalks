import { useState, useRef } from "react";
import { FaCamera } from "react-icons/fa";

const ProfilePhoto = ({ onSave }) => {
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      setPreview(URL.createObjectURL(file));
      localStorage.setItem("avatar", file.name);
    }
  };

  const handleSave = () => {
    if (photo) {
      onSave(photo);
      setPhoto(null);
      setPreview(null);
      fileInputRef.current.value = null;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 gap-5 bg-white/80 backdrop-blur-md shadow-xl rounded-3xl max-w-sm mx-auto mt-10 border border-gray-200">
      <h2 className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">
        Upload Profile Photo
      </h2>

      {/* Upload Button */}
      <label className="flex items-center gap-3 cursor-pointer text-blue-600 hover:text-blue-800 transition text-sm font-medium">
        <FaCamera className="text-lg" />
        <span className="underline">Choose a file</span>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          ref={fileInputRef}
          className="hidden"
        />
      </label>

      {/* Preview */}
      {preview && (
        <div className="flex flex-col items-center gap-4 animate-fadeIn">
          <div className="p-1 rounded-full bg-gradient-to-tr from-pink-500 to-purple-600">
            <img
              src={preview}
              alt="Profile Preview"
              className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-md"
            />
          </div>

          <button
            onClick={handleSave}
            type="button"
            className="px-6 py-2 text-sm font-medium bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full hover:brightness-110 transition"
          >
            Save Photo
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfilePhoto;
