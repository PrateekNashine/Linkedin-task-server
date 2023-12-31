const { asyncErrors } = require("../middlewares/asyncErrors");
const Company = require("../models/companyModel");
const fetchDataFromMongoDB = require("../models/database");
const Job = require("../models/jobModel");
const ErrorHandler = require('../utils/errorHandler');
const { setToken } = require('../utils/setToken');


// Route: /
exports.homepage = asyncErrors(async (req, res, next) => {
    res.json({ message: "Company's Homepage" });
});

// Route: /company (GET)
exports.currentaccount = asyncErrors(async (req, res, next) => {
    const company = await Company.findById(req.id).exec();

    res.json({ company });
});

// Route: /company/signup (POST)
exports.accountsignup = asyncErrors(async (req, res, next) => {
    const company = await new Company(req.body).save();
    setToken(company, 201, res);
});

// Route: /company/signin (POST)
exports.accountsignin = asyncErrors(async (req, res, next) => {
    const company = await Company.findOne({ email: req.body.email }).select("+password").exec();
    if (!company) {
        return next(
            new ErrorHandler('Account associated with this email address not found', 404)
        )
    };

    const validation = company.passwordValidation(req.body.password);

    if (!validation) {
        return next(
            new ErrorHandler('Sorry, your password was incorrect. Please double-check your password.', 401)
        )
    }
    setToken(company, 200, res);
});

// Route: /company/signout
exports.accountsignout = asyncErrors(async (req, res, next) => {
    res.clearCookie("token");
    res.json({ message: 'Successfully signed out!' })
});

// // Route: /company/sendmail (POST)
// exports.companysendmail = asyncErrors(async (req, res, next) => {
//     const company = await Company.findOne({ email: req.body.email }).exec();

//     if (!company) {
//         return next(
//             new ErrorHandler('Account associated with this email address not found', 404)
//         )
//     };

//     // const url = Math.floor(Math.random() * 9000 + 1000);

//     // sendmail(req, res, next, url);

//     // company.resetPasswordToken = `${url}`;
//     // await company.save();

//     res.json({ message: "Email sent!" });
// });

// -----------------------------------------------Jobs----------------------------------------------- 

// Route: /company/job/create (POST)
exports.createJob = asyncErrors(async (req, res, next) => {
    const company = await Company.findById(req.id).exec();
    const job = await new Job(req.body);

    job.company = company._id;
    await job.save();

    company.jobs.push(job._id);
    await company.save();

    res.status(200).json({ success: true, job });
});

// Route: /company/job/read (POST)
exports.readAllJob = asyncErrors(async (req, res, next) => {
    const { jobs } = await Company.findById(req.id)
        .populate("jobs")
        .exec();

    res.status(200).json({ jobs });
});

// Route: /company/job/read/:id (POST)
exports.readJob = asyncErrors(async (req, res, next) => {
    const job = await Job.findById(req.params.id).exec();
    if (!job) {
        return next(
            new ErrorHandler('Job not found!', 404)
        )
    }
    res.status(200).json({ success: true, job });
});

// Route: /company/job/readapplications/:jobid (POST)
exports.readJobApplicatons = asyncErrors(async (req, res, next) => {
    const { appliedUser } = await Job.findById(req.params.id).exec();

    res.status(200).json({ success: true, appliedUser });
});

// Route: /company/job/downloadapplications/:jobid (POST)
exports.downloadApplications = asyncErrors(async (req, res, next) => {
    const company = await Company.findById(req.id).exec();
    const job = await Job.findById(req.params.id).exec();
    fetchDataFromMongoDB(); ``
    res.json({message: "Download .excel file"});
});
