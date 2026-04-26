import { Patient } from "../model/patient_model.js";
import { User } from "../model/user.model.js";
import { Appointment } from "../model/appointment.model.js";

// ================= ADD PATIENT =================
export const addPatient = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      confirmPassword,
      age,
      gender,
      phone,
      address,
      bloodGroup,
    } = req.body;

    if (
      !name ||
      !email ||
      !password ||
      !confirmPassword ||
      !age ||
      !gender ||
      !phone
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

    if (isNaN(age)) {
      return res.status(400).json({
        message: "Age must be a number",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        message: "User already exists with this email",
      });
    }
    const user = await User.create({
      name,
      email,
      password,
      role: "patient",
    });

    // create patient
    const patient = await Patient.create({
      user: user._id,
      age,
      gender,
      phone,
      address,
      bloodGroup,
    });

    const populatedPatient = await Patient.findById(patient._id).populate(
      "user",
      "-password -refreshToken",
    );

    return res.status(201).json({
      success: true,
      message: "Patient created successfully",
      patient: populatedPatient,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error creating patient",
      error: error.message,
    });
  }
};
export const getPatients = async (req, res) => {
  try {
    const patients = await Patient.find().populate(
      "user",
      "-password -refreshToken",
    );

    return res.status(200).json({
      success: true,
      count: patients.length,
      patients,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching patients",
      error: error.message,
    });
  }
};
export const getPatientById = async (req, res) => {
  try {
    const { id } = req.params;

    const patient = await Patient.findById(id).populate(
      "user",
      "-password -refreshToken",
    );

    if (!patient) {
      return res.status(404).json({
        message: "Patient not found",
      });
    }

    return res.status(200).json({
      success: true,
      patient,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching patient",
      error: error.message,
    });
  }
};
export const updatePatient = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedPatient = await Patient.findByIdAndUpdate(id, req.body, {
      new: true,
    }).populate("user", "-password -refreshToken");

    if (!updatedPatient) {
      return res.status(404).json({
        message: "Patient not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Patient updated successfully",
      patient: updatedPatient,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error updating patient",
      error: error.message,
    });
  }
};
export const deletePatient = async (req, res) => {
  try {
    const { id } = req.params;

    const patient = await Patient.findByIdAndDelete(id);

    if (!patient) {
      return res.status(404).json({
        message: "Patient not found",
      });
    }

    await User.findByIdAndDelete(patient.user);

    return res.status(200).json({
      success: true,
      message: "Patient deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error deleting patient",
      error: error.message,
    });
  }
};

export const requestAppointment = async (req, res) => {
  try {
    const patientId = req.user.id; // from auth
    const { doctorId, date, time, reason } = req.body;

    if (!doctorId || !date || !time) {
      return res.status(400).json({
        message: "Doctor, date and time required",
      });
    }
    const existingAppointment = await Appointment.findOne({
      doctor: doctorId,
      date,
      time,
      status: { $in: ["pending", "confirmed"] },
    });

    if (existingAppointment) {
      return res.status(409).json({
        success: false,
        message: "This time slot is already booked",
      });
    }

    const appointment = await Appointment.create({
      patient: patientId,
      doctor: doctorId,
      date,
      time,
      reason,
      status: "pending",
    });

    return res.status(201).json({
      success: true,
      message: "Appointment request sent",
      appointment,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const getMyAppointments = async (req, res) => {
  try {
    const patientId = req.user.id;

    const appointments = await Appointment.find({ patient: patientId })
      .populate("doctor")
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

export const cancelAppointment = async (req, res) => {
  try {
    const patientId = req.user.id;
    const { appointmentId } = req.params;

    const appointment = await Appointment.findOne({
      _id: appointmentId,
      patient: patientId,
    });

    if (!appointment) {
      return res.status(404).json({
        message: "Appointment not found",
      });
    }

    if (appointment.status === "rejected") {
      return res.status(400).json({
        message: "Already rejected appointment cannot be cancelled",
      });
    }

    appointment.status = "cancelled";
    await appointment.save();

    return res.status(200).json({
      success: true,
      message: "Appointment cancelled",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};