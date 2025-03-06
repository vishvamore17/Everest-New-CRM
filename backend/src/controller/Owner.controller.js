const Owner = require('../model/OwnerSchema.model');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads')); // Adjusted path to 'backend/src/uploads'
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
}).single('logo');

const addOwner = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      console.error('Multer Error:', err);
      return res.status(400).json({ message: 'Error uploading file', error: err.message });
    }

    try {
      const {
        companyName,
        ownerName,
        contactNumber,
        emailAddress,
        website,
        businessRegistration,
        companyType,
        employeeSize,
        panNumber,
        documentType,
        documentNumber,
      } = req.body;

      // Extracting only the '/uploads/...' part from the full path
      const logoPath = req.file ? `/uploads/${path.basename(req.file.path)}` : null;

      const newOwner = new Owner({
        logo: logoPath,
        companyName,
        ownerName,
        contactNumber,
        emailAddress,
        website,
        businessRegistration,
        companyType,
        employeeSize,
        panNumber,
        documentType,
        documentNumber,
        dataFilled: true,
      });

      await newOwner.save();
      res.status(201).json({ message: 'Owner added successfully', data: newOwner, datafilled: true });
    } catch (error) {
      console.error('Backend Error:', error);
      res.status(400).json({ message: 'Error adding owner', error: error.message });
    }
  });
};

// Update Owner API
const updateOwner = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      console.error("Multer Error:", err);
      return res.status(400).json({ message: "Error uploading file", error: err.message });
    }

    try {
      const ownerId = req.params.id;

      // Log the request body and file for debugging
      console.log("Request Body:", req.body);
      console.log("Uploaded File:", req.file);

      // Fetch existing owner details
      const existingOwner = await Owner.findById(ownerId);
      if (!existingOwner) {
        return res.status(404).json({ message: "Owner not found" });
      }

      // If a new logo is uploaded, update the logo path
      const logoPath = req.file ? `/uploads/${path.basename(req.file.path)}` : existingOwner.logo;

      // Update owner details
      const updatedData = {
        companyName: req.body.companyName || existingOwner.companyName,
        ownerName: req.body.ownerName || existingOwner.ownerName,
        contactNumber: req.body.contactNumber || existingOwner.contactNumber,
        emailAddress: req.body.emailAddress || existingOwner.emailAddress,
        website: req.body.website || existingOwner.website,
        businessRegistration: req.body.businessRegistration || existingOwner.businessRegistration,
        companyType: req.body.companyType || existingOwner.companyType,
        employeeSize: req.body.employeeSize || existingOwner.employeeSize,
        panNumber: req.body.panNumber || existingOwner.panNumber,
        documentType: req.body.documentType || existingOwner.documentType,
        documentNumber: req.body.documentNumber || existingOwner.documentNumber,
        logo: logoPath, // Use new logo if uploaded, otherwise keep existing
      };

      // Save updated owner details
      const updatedOwner = await Owner.findByIdAndUpdate(ownerId, updatedData, { new: true });

      res.status(200).json({ message: "Owner updated successfully", data: updatedOwner });
    } catch (error) {
      console.error("Backend Error:", error);
      res.status(500).json({ message: "Error updating owner", error: error.message });
    }
  });
};
// const updateOwner = async (req, res) => {
//   const { id } = req.params;
//   try {
//     const updatedOwner = await Owner.findByIdAndUpdate(id, req.body, { new: true });
//     if (!updatedOwner) {
//       return res.status(404).json({ message: 'Owner not found' });
//     }
//     res.status(200).json({ message: 'Owner updated successfully', data: updatedOwner });
//   } catch (error) {
//     res.status(400).json({ message: 'Error updating owner', error: error.message });
//   }
// };

// Get all owners
const getOwners = async (req, res) => {
  try {
    const owners = await Owner.find();
    res.status(200).json({ message: 'Owners fetched successfully', data: owners });
  } catch (error) {
    res.status(400).json({ message: 'Error fetching owners', error: error.message });
  }
};

// Get a specific owner by ID
// const getOwnerById = async (req, res) => {
//   const { id } = req.params;
//   try {
//     const owner = await Owner.findById(id);
//     if (!owner) {
//       return res.status(404).json({ message: 'Owner not found' });
//     }
//     res.status(200).json({ message: 'Owner fetched successfully', data: owner });
//   } catch (error) {
//     res.status(400).json({ message: 'Error fetching owner', error: error.message });
//   }
// };

// Delete an owner
const deleteOwner = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedOwner = await Owner.findByIdAndDelete(id);
    if (!deletedOwner) {
      return res.status(404).json({ message: 'Owner not found' });
    }
    res.status(200).json({ message: 'Owner deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Error deleting owner', error: error.message });
  }
};

// Get the count of owners
const getOwnerCount = async (req, res) => {
  try {
    const count = await Owner.countDocuments();  // Get the count of owners in the database
    res.status(200).json({ count });
  } catch (error) {
    res.status(400).json({ message: 'Error fetching owner count', error: error.message });
  }
};

// Get owner data for generating invoice PDF
const getOwnerForInvoice = async (req, res) => {
  try {
    // Assuming the first owner is the one used for the invoice
    const owner = await Owner.findOne(); // You can modify this to fetch a specific owner if needed
    if (!owner) {
      return res.status(404).json({ message: 'Owner not found' });
    }
    res.status(200).json({
      message: 'Owner data fetched successfully for invoice',
      data: {
        companyName: owner.companyName,
        contactNumber: owner.contactNumber,
        emailAddress: owner.emailAddress,
        gstNumber: owner.gstNumber,
        website: owner.website,
        logo : owner.logo
      },
    });
  } catch (error) {
    res.status(400).json({ message: 'Error fetching owner data for invoice', error: error.message });
  }
};

module.exports = {
  upload,
  addOwner,
  updateOwner,
  getOwners,
  // getOwnerById,
  deleteOwner,
  getOwnerCount, 
  getOwnerForInvoice // Export the count function
};
 