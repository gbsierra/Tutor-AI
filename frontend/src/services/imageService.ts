export class ImageService {
  static async toBase64(fileOrBlob: File | Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(reader.error);
      reader.onload = () => resolve(String(reader.result).split(",").pop() || "");
      reader.readAsDataURL(fileOrBlob);
    });
  }

  static async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result).split(",").pop() || "");
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  static async convertHeicViaCloudinary(file: File): Promise<Blob> {
    // Cloudinary configuration
    // Sign up at https://cloudinary.com and get these values from your dashboard
    const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME ||
                      'your-cloud-name'; // Replace with your Cloudinary cloud name
    const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET ||
                         'your-upload-preset'; // Replace with your unsigned upload preset

    if (CLOUD_NAME === 'your-cloud-name' || UPLOAD_PRESET === 'your-upload-preset') {
      throw new Error(
        'Cloudinary not configured. Please:\n' +
        '1. Sign up at https://cloudinary.com\n' +
        '2. Get your Cloud Name from Dashboard\n' +
        '3. Create an Upload Preset (Settings → Upload) with:\n' +
        '   - Mode: Unsigned (in General tab)\n' +
        '   - Add transformation: f_png,q_90 (in Transform tab → Incoming transformation)\n' +
        '   - This converts HEIC to PNG during upload with high quality\n' +
        '4. Create .env file with:\n' +
        '   VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name\n' +
        '   VITE_CLOUDINARY_UPLOAD_PRESET=your-upload-preset'
      );
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);
    // Note: Format conversion to PNG with high quality happens during upload via preset

    const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

    console.log('Uploading to Cloudinary:', {
      cloudName: CLOUD_NAME,
      preset: UPLOAD_PRESET,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      note: 'Format conversion handled by upload preset (PNG, high quality) during upload'
    });

    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Cloudinary upload failed:', response.status, errorData);
      throw new Error(`Cloudinary upload failed: ${response.status} - ${errorData}`);
    }

    const result = await response.json();
    console.log('Cloudinary upload response:', result);

    if (!result.secure_url && !result.url) {
      console.error('No URL in Cloudinary response:', result);
      throw new Error('Cloudinary upload succeeded but no image URL returned');
    }

    // The preset already converted to PNG during upload, so use the URL as-is
    const imageUrl = result.secure_url || result.url;
    console.log('Fetching converted image from:', imageUrl);

    // Download the converted image
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error(`Failed to download converted image: ${imageResponse.status}`);
    }

    const convertedBlob = await imageResponse.blob();
    console.log('Final conversion result:', {
      originalSize: file.size,
      convertedSize: convertedBlob.size,
      format: convertedBlob.type,
      url: imageUrl
    });

    // Verify the conversion actually happened
    if (convertedBlob.size === file.size && convertedBlob.type === 'image/heic') {
      console.warn('WARNING: File size and type unchanged - conversion may have failed');
    }

    // PNG files (high quality) should be the result of HEIC conversion with preset
    if (convertedBlob.type !== 'image/png') {
      console.warn('WARNING: Expected PNG format, got:', convertedBlob.type);
    }

    return convertedBlob;
  }

  static validateFile(file: File): boolean {
    // Accept images by MIME type OR by file extension (for HEIC and other formats)
    const isImageFile = file.type.startsWith('image/') ||
                       !!file.name.toLowerCase().match(/\.(heic|heif|jpg|jpeg|png|gif|bmp|webp|svg)$/i);

    return isImageFile;
  }
}
