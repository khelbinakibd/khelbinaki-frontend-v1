/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../lib/api";
import { toast } from "sonner";
import { UploadCloud, X, AlertCircle } from "lucide-react";

type PricingRule = {
  dayType: string;
  startTime: string;
  endTime: string;
  pricePerSlot: string | number;
};

const PRESET_AMENITIES = [
  { key: "Floodlights", label: "Floodlights", icon: "💡" },
  { key: "Parking", label: "Parking", icon: "🅿️" },
  { key: "Gallery", label: "Gallery", icon: "🖼️" },
  { key: "Changing Room", label: "Changing Room", icon: "🚻" },
  { key: "WiFi", label: "WiFi", icon: "📶" },
];

const CreateTurfs: React.FC = () => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "",
    description: "",
    defaultPricePerSlot: "",
    startHour: "06:00",
    endHour: "23:00",
    admins: [""],
    isActive: true,
    slug: "",
    googleMap: "",
      bkashNumber:"",
    pricingRules: [{ dayType: "all-days", startTime: "06:00", endTime: "23:00", pricePerSlot: "" }],
  });

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  const mutation = useMutation({
    mutationFn: async (payload: any) => {
      console.log('🏟️ Creating turf with payload:', payload);

      // STEP 1: Create the turf first
      const turfResponse = await api.post("/turfs", payload);
      console.log('✅ Turf created:', turfResponse.data);

      const newTurf = turfResponse.data.data || turfResponse.data;

      if (!newTurf?._id) {
        console.error('❌ No turf ID in response:', turfResponse.data);
        throw new Error("Failed to create turf or get turf ID.");
      }

      const turfId = newTurf._id;
      console.log('📝 Turf ID:', turfId);

      // STEP 2: Upload images one by one (sequential) with delays
      if (imageFiles.length > 0) {
        toast.info(`Turf created! Now uploading ${imageFiles.length} image(s)...`);
        
        for (let i = 0; i < imageFiles.length; i++) {
          const file = imageFiles[i];
          const formData = new FormData();
          formData.append('image', file);
          
          try {
            console.log(`📸 Uploading image ${i + 1}/${imageFiles.length}...`);
            
            await api.patch(`/admin/turfs/${turfId}/image`, formData, {
              headers: { 'Content-Type': 'multipart/form-data' },
            });
            
            console.log(`✅ Image ${i + 1} uploaded successfully`);
            toast.success(`Image ${i + 1}/${imageFiles.length} uploaded`);
            
            // Add a small delay between uploads to avoid overwhelming the server
            if (i < imageFiles.length - 1) {
              await new Promise(resolve => setTimeout(resolve, 500));
            }
          } catch (uploadError: any) {
            console.error(`❌ Failed to upload image ${i + 1}:`, uploadError);
            toast.error(`Failed to upload image ${i + 1}: ${uploadError.response?.data?.message || 'Unknown error'}`);
            // Continue with other images even if one fails
          }
        }
      }

      return newTurf;
    },
    onSuccess: () => {
      toast.success("Turf and all images uploaded successfully!");
      // Reset form and file states
      setFormData({
        name: "", address: "", city: "", description: "", defaultPricePerSlot: "",
        startHour: "06:00", endHour: "23:00", admins: [""], googleMap:"",isActive: true, slug: "",
        bkashNumber: "" ,
        pricingRules: [{ dayType: "all-days", startTime: "06:00", endTime: "23:00", pricePerSlot: "" }],
      });
      setSelectedAmenities([]);
      setImageFiles([]);
      setImagePreviews([]);
      queryClient.invalidateQueries({ queryKey: ['admin-turfs'] });
    },
    onError: (err: any) => {
      console.error('❌ Error creating turf:', err);
      const errorMessage = err?.response?.data?.message || err.message || "An error occurred during creation!";
      toast.error(errorMessage);
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((s) => ({ ...s, [e.target.name]: e.target.value }));
  };

  const toggleAmenity = (key: string) => setSelectedAmenities((s) => s.includes(key) ? s.filter((k) => k !== key) : [...s, key]);
  
  const handleRuleChange = (index: number, field: keyof PricingRule, value: string) => {
    const updated = [...formData.pricingRules];
    (updated[index] as any)[field] = value;
    setFormData((s) => ({ ...s, pricingRules: updated }));
  };
  
  const addRule = () => setFormData((s) => ({ ...s, pricingRules: [...s.pricingRules, { dayType: "all-days", startTime: "06:00", endTime: "23:00", pricePerSlot: "" }] }));
  const removeRule = (index: number) => setFormData((s) => ({ ...s, pricingRules: s.pricingRules.filter((_, i) => i !== index) }));
  
  const handleAdminChange = (index: number, value: string) => { 
    const updated = [...formData.admins]; 
    updated[index] = value; 
    setFormData((s) => ({ ...s, admins: updated })); 
  };
  
  const addAdmin = () => setFormData((s) => ({ ...s, admins: [...s.admins, ""] }));
  const removeAdmin = (index: number) => setFormData((s) => ({ ...s, admins: s.admins.filter((_, i) => i !== index) }));
  
  const groupPricingRules = () => {
     
    const grouped: any = {};
    formData.pricingRules.forEach((rule) => {
      if (!rule.dayType) return;
      if (!grouped[rule.dayType]) grouped[rule.dayType] = { dayType: rule.dayType, timeSlots: [] };
      grouped[rule.dayType].timeSlots.push({ startTime: rule.startTime, endTime: rule.endTime, pricePerSlot: Number(rule.pricePerSlot) });
    });
    return Object.values(grouped);
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      
      // Validate file size (5MB limit)
      const oversizedFiles = files.filter(f => f.size > 5 * 1024 * 1024);
      if (oversizedFiles.length > 0) {
        toast.error(`${oversizedFiles.length} file(s) exceed 5MB limit`);
        return;
      }
      
      setImageFiles(prev => [...prev, ...files]);

      const newPreviews = files.map(file => URL.createObjectURL(file));
      setImagePreviews(prev => [...prev, ...newPreviews]);
      
      toast.success(`${files.length} image(s) selected`);
    }
  };

  const removeImage = (index: number) => {
    // Revoke the object URL to free memory
    URL.revokeObjectURL(imagePreviews[index]);
    
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate admin IDs format
    const adminIds = formData.admins.filter(Boolean);
    const invalidAdminIds = adminIds.filter(id => !/^[0-9a-fA-F]{24}$/.test(id));
    
    if (invalidAdminIds.length > 0) {
      toast.error("Invalid admin ID format. Must be 24 character hexadecimal.");
      console.error('❌ Invalid admin IDs:', invalidAdminIds);
      return;
    }

    if (adminIds.length === 0) {
      toast.error("At least one admin must be assigned");
      return;
    }

    console.log('🚀 Submitting turf with admin IDs:', adminIds);

    const payload = {
      name: formData.name,
      location: { address: formData.address, city: formData.city },
      description: formData.description,
      defaultPricePerSlot: Number(formData.defaultPricePerSlot) || 0,
      pricingRules: groupPricingRules(),
      operatingHours: { start: formData.startHour, end: formData.endHour },
      amenities: selectedAmenities,
      admins: adminIds, // Only non-empty admin IDs
      googleMap: formData.googleMap,
      bkashNumber: formData.bkashNumber,
      isActive: formData.isActive,
      slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, "-"),
    };

    console.log('📦 Final payload:', payload);
    mutation.mutate(payload);
  };

  return (
    <div className="min-h-screen flex justify-center bg-green-50 p-6">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-center mb-6">Create New Turf</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="grid  grid-cols-1 md:grid-cols-2 gap-4">
            <input 
              name="name" 
              value={formData.name} 
              onChange={handleChange} 
              placeholder="Turf Name" 
              className="p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-200" 
              required 
            />
            <input 
              name="address" 
              value={formData.address} 
              onChange={handleChange} 
              placeholder="Address" 
              className="p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-200" 
              required 
            />

             <input 
              name="city" 
              value={formData.city} 
              onChange={handleChange} 
              placeholder="City" 
              className="p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-200" 
              required 
            />
                        <input 
              name="defaultPricePerSlot" 
              value={formData.defaultPricePerSlot} 
              onChange={handleChange} 
              type="number" 
              placeholder="Default Price Per Hour" 
              className="p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-200" 
              required 
            />
            <input 
              name="googleMap" 
              value={formData.googleMap} 
              onChange={handleChange} 
              type="text" 
              placeholder="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d37951.29673268074!2d91.08239655968323!3d22.997831219926393!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3754a11b3c834925%3A0x9b23219308c09100!2sHazipur!5e1!3m2!1sen!2sbd!4v1760555757107!5m2!1sen!2sbd" 
              className="p-3 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-200 " 
              required 
            />
            <input 
              name="bkashNumber" 
              value={formData.bkashNumber} 
              onChange={handleChange} 
              type="text" 
              placeholder="Enter the turf bkash number" 
              className="p-3 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-200 " 
              required 
            />
          </div>

          <textarea 
            name="description" 
            value={formData.description} 
            onChange={handleChange} 
            rows={3} 
            placeholder="Description" 
            className="w-full p-3 border rounded-lg" 
            required 
          />
          
          {/* Image Upload */}
          <div>
            <h3 className="font-semibold mb-2">Upload Images</h3>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-emerald-400 hover:bg-emerald-50 transition-colors">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="image-upload"
              />
              <label htmlFor="image-upload" className="cursor-pointer">
                <UploadCloud className="w-10 h-10 mx-auto text-gray-400 mb-2"/>
                <p className="text-sm font-semibold text-gray-700">Click to upload or drag and drop</p>
                <p className="text-xs text-gray-500">PNG, JPG, WEBP (MAX. 5MB each)</p>
              </label>
            </div>
            
            {imagePreviews.length > 0 && (
              <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group aspect-square">
                    <img src={preview} alt={`preview ${index + 1}`} className="w-full h-full object-cover rounded-lg shadow-md"/>
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={16}/>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Amenities */}
          <div>
            <h3 className="font-semibold mb-2">Amenities</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {PRESET_AMENITIES.map((a) => (
                <button 
                  key={a.key} 
                  type="button" 
                  onClick={() => toggleAmenity(a.key)} 
                  className={`flex flex-col items-center gap-1 p-2 border rounded-lg transition ${selectedAmenities.includes(a.key) ? "bg-emerald-50 border-emerald-400" : "border-gray-200 hover:shadow"}`}
                >
                  <div className="text-xl">{a.icon}</div>
                  <div className="text-sm">{a.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Admins - ENHANCED */}
          <div>
            <h3 className="font-semibold mb-2">Admins (MongoDB ObjectIDs) *</h3>
            <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg flex gap-2">
              <AlertCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={18} />
              <p className="text-xs text-blue-800">
                Paste the admin ID you received after creating an admin. 
                It should be 24 characters long (e.g., 507f1f77bcf86cd799439011)
              </p>
            </div>
            {formData.admins.map((a, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input 
                  type="text" 
                  value={a} 
                  onChange={(e) => handleAdminChange(i, e.target.value)} 
                  placeholder="e.g., 507f1f77bcf86cd799439011" 
                  className={`flex-1 p-2 border rounded-lg font-mono text-sm ${
                    a && !/^[0-9a-fA-F]{24}$/.test(a) 
                      ? 'border-red-500 bg-red-50' 
                      : 'border-gray-300'
                  }`}
                  required={i === 0}
                />
                {formData.admins.length > 1 && (
                  <button 
                    type="button" 
                    onClick={() => removeAdmin(i)} 
                    className="px-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                  >
                    X
                  </button>
                )}
              </div>
            ))}
            <button 
              type="button" 
              onClick={addAdmin} 
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              + Add Another Admin
            </button>
          </div>

          {/* Pricing Rules */}
          <div>
            <h3 className="font-semibold mb-2">Pricing Rules</h3>
            {formData.pricingRules.map((rule, idx) => (
              <div key={idx} className="grid grid-cols-1 md:grid-cols-6 gap-2 items-center mb-2 p-3 bg-gray-50 rounded-lg">
                <select 
                  value={rule.dayType} 
                  onChange={(e) => handleRuleChange(idx, "dayType", e.target.value)} 
                  className="col-span-2 p-2 border rounded-lg"
                  required
                >
                  <option value="">Select Day Type</option>
                  <option value="sunday-thursday">Sunday-Thursday</option>
                  <option value="friday-saturday">Friday-Saturday</option>
                  <option value="all-days">All Days</option>
                </select>
                <input 
                  type="time" 
                  value={rule.startTime} 
                  onChange={(e) => handleRuleChange(idx, "startTime", e.target.value)} 
                  className="p-2 border rounded-lg" 
                  required
                />
                <input 
                  type="time" 
                  value={rule.endTime} 
                  onChange={(e) => handleRuleChange(idx, "endTime", e.target.value)} 
                  className="p-2 border rounded-lg" 
                  required
                />
                <input 
                  type="number" 
                  value={rule.pricePerSlot as any} 
                  onChange={(e) => handleRuleChange(idx, "pricePerSlot", e.target.value)} 
                  placeholder="Price" 
                  className="p-2 border rounded-lg" 
                  required
                />
                <button 
                  type="button" 
                  onClick={() => removeRule(idx)} 
                  className="px-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                  disabled={formData.pricingRules.length === 1}
                >
                  Remove
                </button>
              </div>
            ))}
            <button 
              type="button" 
              onClick={addRule} 
              className="px-4 py-2 bg-green-600 text-white rounded-lg mt-2 hover:bg-green-700 transition"
            >
              + Add Pricing Rule
            </button>
          </div>

          <div className="flex justify-center">
            <button 
              type="submit" 
              disabled={mutation.isPending} 
              className="px-8 py-3 bg-green-600 text-white rounded-lg font-semibold shadow-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {mutation.isPending ? "Creating Turf..." : "Create Turf"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTurfs;
