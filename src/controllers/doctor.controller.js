import { Doctor } from "../model/doctor.model.js";
import { User } from "../model/user.model.js";
import { uploadCloudinary } from "../utils/cloudinary.js";
import { Appointment } from "../model/appointemnt_model.js";

// ================= ADD DOCTOR =================
export const addDoctor = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      confirmPassword,
      specialization,
      experience,
      fee,
      hospital,
    } = req.body;

    if (
      !name ||
      !email ||
      !password ||
      !confirmPassword ||
      !specialization ||
      !experience ||
      !fee
    ) {
      return res.status(400).json({
        message: "All required fields must be provided",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        message: "Passwords do not match",
      });
    }

    if (isNaN(experience) || isNaN(fee)) {
      return res.status(400).json({
        message: "Experience and fee must be numbers",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        message: "User already exists with this email",
      });
    }

    // 🔥 upload image if exists
    let imageUrl = "";
    if (req.file?.path) {
      const uploaded = await uploadCloudinary(req.file.path);
      imageUrl = uploaded?.secure_url;
    }

    // create user
    const user = await User.create({
      name,
      email,
      password,
      role: "doctor",
      profileImage: imageUrl, // 👈 added
    });

    // create doctor
    const doctor = await Doctor.create({
      user: user._id,
      specialization,
      experience,
      fee,
      hospital,
    });

    const populatedDoctor = await Doctor.findById(doctor._id).populate(
      "user",
      "-password -refreshToken",
    );

    return res.status(201).json({
      success: true,
      message: "Doctor created successfully",
      doctor: populatedDoctor,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error creating doctor",
      error: error.message,
    });
  }
};
export const updateDoctorProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    let imageUrl;

    if (req.file?.path) {
      const uploaded = await uploadCloudinary(req.file.path);
      imageUrl = uploaded?.secure_url;
    }

    const updatedDoctor = await User.findByIdAndUpdate(
      userId,
      {
        ...req.body,
        ...(imageUrl && { profileImage: imageUrl }),
      },
      { new: true },
    ).select("-password");

    return res.status(200).json({
      success: true,
      message: "Doctor profile updated",
      doctor: updatedDoctor,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};
export const getDoctorsForPatient = async (req, res) => {
  try {
    const doctors = await Doctor.find()
      .populate({ path: "user", select: "name email profileImage phone" })
      .sort({ createdAt: -1 });
    if (!doctors || doctors.length === 0) {
      return res.status(404).json({ message: "No doctors available" });
    }
    return res
      .status(200)
      .json({ success: true, count: doctors.length, doctors });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error fetching doctors", error: error.message });
  }
};

export const getDoctorAppointments = async (req, res) => {
  try {
    const doctorId = req.user.id;

    const appointments = await Appointment.find({ doctor: doctorId })
      .populate({
        path: "patient",
        populate: {
          path: "user",
          select: "name email phone profileImage",
        },
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      appointments,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const updateAppointmentStatus = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { status } = req.body; // confirmed / rejected

    if (!["confirmed", "rejected"].includes(status)) {
      return res.status(400).json({
        message: "Invalid status",
      });
    }

    const appointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      { status },
      { new: true },
    );

    if (!appointment) {
      return res.status(404).json({
        message: "Appointment not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: `Appointment ${status}`,
      appointment,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const getDoctorById = async (req, res) => {
  try {
    const { id } = req.params;

    const doctor = await Doctor.findById(id).populate({
      path: "user",
      select: "name email profileImage phone",
    });

    if (!doctor) {
      return res.status(404).json({
        message: "Doctor not found",
      });
    }

    return res.status(200).json({
      success: true,
      doctor,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};
export const getDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find()
      .populate({
        path: "user",
        select: "name email profileImage phone",
      })
      .sort({ createdAt: -1 });

    if (!doctors.length) {
      return res.status(404).json({
        message: "No doctors found",
      });
    }

    return res.status(200).json({
      success: true,
      count: doctors.length,
      doctors,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};