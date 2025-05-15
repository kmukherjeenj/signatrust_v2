// components/Dashboard/KYCVerification.tsx
import React, { useState, useRef } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardFooter,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import { verifyIdentity, getKYCStatus } from "../lib/api";
import { UserData } from "../shared/types";
import { Upload, Check, Shield, AlertTriangle } from "lucide-react";
import { log, logError } from "../utils/client_logger";

interface KYCVerificationProps {
  user: UserData;
  onVerificationComplete: (status: string) => void;
}

const KYCVerification: React.FC<KYCVerificationProps> = ({
  user,
  onVerificationComplete,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<{
    [key: string]: File | null;
  }>({
    selfie: null,
    idDocument: null,
    addressProof: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<string | null>(
    null
  );
  const [verificationDetails, setVerificationDetails] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedVerificationLevel, setSelectedVerificationLevel] =
    useState("standard");

  const selfieInputRef = useRef<HTMLInputElement>(null);
  const idDocumentInputRef = useRef<HTMLInputElement>(null);
  const addressProofInputRef = useRef<HTMLInputElement>(null);

  const verificationLevels = [
    {
      id: "basic",
      name: "Basic Verification",
      description: "Email verification and basic identity confirmation",
      requirements: ["Valid email address"],
      legalStanding: "Suitable for low-value agreements",
    },
    {
      id: "standard",
      name: "Standard Verification",
      description: "Government ID and selfie verification",
      requirements: ["Valid government ID", "Selfie verification"],
      legalStanding: "Suitable for most business agreements",
    },
    {
      id: "advanced",
      name: "Advanced Verification",
      description: "Full KYC with address proof and additional verification",
      requirements: [
        "Valid government ID",
        "Selfie verification",
        "Proof of address",
        "Additional verification",
      ],
      legalStanding: "Suitable for high-value and legally sensitive agreements",
    },
  ];

  const steps = [
    {
      title: "Select Verification Level",
      fileType: null,
      description: "Choose the appropriate verification level for your needs",
    },
    {
      title: "Upload Selfie",
      fileType: "selfie",
      description: "Upload a clear photo of your face",
    },
    {
      title: "Upload ID Document",
      fileType: "idDocument",
      description:
        "Upload your passport, driver's license, or national ID card",
    },
    {
      title: "Upload Address Proof",
      fileType: "addressProof",
      description:
        "Upload a utility bill, bank statement, or other proof of address (no older than 3 months)",
    },
    {
      title: "Review & Submit",
      fileType: null,
      description: "Review your documents and submit for verification",
    },
  ];

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    fileType: string
  ) => {
    if (e.target.files && e.target.files[0]) {
      log("info", `${fileType} file selected`, {
        fileName: e.target.files[0].name,
      });
      setUploadedFiles((prev) => ({
        ...prev,
        [fileType]: e.target.files![0],
      }));
    }
  };

  const handleFileUploadClick = (fileType: string) => {
    if (fileType === "selfie" && selfieInputRef.current) {
      selfieInputRef.current.click();
    } else if (fileType === "idDocument" && idDocumentInputRef.current) {
      idDocumentInputRef.current.click();
    } else if (fileType === "addressProof" && addressProofInputRef.current) {
      addressProofInputRef.current.click();
    }
  };

  const checkKYCStatus = async () => {
    try {
      log("info", "Checking KYC status", { did: user.did });
      const status = await getKYCStatus(user.did);
      setVerificationStatus(status.status);
      setVerificationDetails(status.verification_details);
      log("info", "KYC status checked", { status: status.status });
      return status;
    } catch (error) {
      logError(
        error instanceof Error ? error : new Error(String(error)),
        "Error checking KYC status"
      );
      setErrorMessage("Failed to check verification status");
      return null;
    }
  };

  const handleNextStep = () => {
    // Skip address proof step for basic verification
    if (selectedVerificationLevel === "basic" && currentStep === 2) {
      setCurrentStep(4);
    }
    // Skip address proof step for standard verification
    else if (selectedVerificationLevel === "standard" && currentStep === 3) {
      setCurrentStep(4);
    }
    // Normal progression
    else if (currentStep < steps.length - 1) {
      setCurrentStep((prevStep) => prevStep + 1);
    }
  };

  const handlePreviousStep = () => {
    // Skip address proof step when going back for basic verification
    if (selectedVerificationLevel === "basic" && currentStep === 4) {
      setCurrentStep(2);
    }
    // Skip address proof step when going back for standard verification
    else if (selectedVerificationLevel === "standard" && currentStep === 4) {
      setCurrentStep(3);
    }
    // Normal progression
    else if (currentStep > 0) {
      setCurrentStep((prevStep) => prevStep - 1);
    }
  };

  const handleSubmit = async () => {
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      log("info", "Submitting KYC verification", {
        did: user.did,
        level: selectedVerificationLevel,
      });

      // Create form data for API call
      const formData = new FormData();
      formData.append("did", user.did);
      formData.append("verificationLevel", selectedVerificationLevel);

      // Add files based on verification level
      if (selectedVerificationLevel === "basic") {
        if (!uploadedFiles.selfie) {
          throw new Error("Please upload a selfie");
        }
        formData.append("selfie", uploadedFiles.selfie);
      } else if (selectedVerificationLevel === "standard") {
        if (!uploadedFiles.selfie || !uploadedFiles.idDocument) {
          throw new Error("Please upload all required documents");
        }
        formData.append("selfie", uploadedFiles.selfie);
        formData.append("idDocument", uploadedFiles.idDocument);
      } else if (selectedVerificationLevel === "advanced") {
        if (
          !uploadedFiles.selfie ||
          !uploadedFiles.idDocument ||
          !uploadedFiles.addressProof
        ) {
          throw new Error("Please upload all required documents");
        }
        formData.append("selfie", uploadedFiles.selfie);
        formData.append("idDocument", uploadedFiles.idDocument);
        formData.append("addressProof", uploadedFiles.addressProof);
      }

      // Call API to verify identity
      const result = await verifyIdentity(formData);
      log("info", "KYC verification submitted successfully", { result });

      // Check KYC status after submission
      const status = await checkKYCStatus();

      if (status) {
        onVerificationComplete(status.status);
      }

      setVerificationStatus("pending");
    } catch (error) {
      logError(
        error instanceof Error ? error : new Error(String(error)),
        "Error submitting KYC verification"
      );
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to submit verification"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    const step = steps[currentStep];

    // Verification level selection step
    if (currentStep === 0) {
      return (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">{step.title}</h3>
          <p className="text-gray-400">{step.description}</p>

          <div className="space-y-4">
            {verificationLevels.map((level) => (
              <div
                key={level.id}
                className={`p-4 rounded-lg border-2 cursor-pointer ${
                  selectedVerificationLevel === level.id
                    ? "border-indigo-500 bg-indigo-900/20"
                    : "border-gray-700 bg-gray-800"
                }`}
                onClick={() => setSelectedVerificationLevel(level.id)}
              >
                <div className="flex items-center">
                  <div
                    className={`w-5 h-5 rounded-full mr-3 flex items-center justify-center ${
                      selectedVerificationLevel === level.id
                        ? "bg-indigo-500"
                        : "bg-gray-700"
                    }`}
                  >
                    {selectedVerificationLevel === level.id && (
                      <Check className="w-3 h-3 text-white" />
                    )}
                  </div>
                  <h4 className="font-medium">{level.name}</h4>
                </div>
                <p className="mt-2 text-sm text-gray-400">
                  {level.description}
                </p>
                <div className="mt-3">
                  <p className="text-xs text-gray-500">Requirements:</p>
                  <ul className="list-disc list-inside text-xs text-gray-400 mt-1">
                    {level.requirements.map((req, i) => (
                      <li key={i}>{req}</li>
                    ))}
                  </ul>
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  {level.legalStanding}
                </p>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // Review step
    if (currentStep === 4) {
      const requiredFiles =
        selectedVerificationLevel === "basic"
          ? ["selfie"]
          : selectedVerificationLevel === "standard"
          ? ["selfie", "idDocument"]
          : ["selfie", "idDocument", "addressProof"];

      return (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">{step.title}</h3>
          <p className="text-gray-400">{step.description}</p>

          <div className="p-3 rounded-lg bg-gray-700">
            <p className="font-medium">Selected Verification Level:</p>
            <p className="text-sm text-gray-300">
              {verificationLevels.find(
                (l) => l.id === selectedVerificationLevel
              )?.name || selectedVerificationLevel}
            </p>
          </div>

          <div className="space-y-2">
            {requiredFiles.includes("selfie") && (
              <div className="bg-gray-800 p-3 rounded-md">
                <div className="flex items-center">
                  <div className="mr-2">
                    {uploadedFiles.selfie ? (
                      <Check className="text-green-500" />
                    ) : (
                      <AlertTriangle className="text-yellow-500" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">Selfie</p>
                    <p className="text-xs text-gray-400">
                      {uploadedFiles.selfie?.name || "Not uploaded"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {requiredFiles.includes("idDocument") && (
              <div className="bg-gray-800 p-3 rounded-md">
                <div className="flex items-center">
                  <div className="mr-2">
                    {uploadedFiles.idDocument ? (
                      <Check className="text-green-500" />
                    ) : (
                      <AlertTriangle className="text-yellow-500" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">ID Document</p>
                    <p className="text-xs text-gray-400">
                      {uploadedFiles.idDocument?.name || "Not uploaded"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {requiredFiles.includes("addressProof") && (
              <div className="bg-gray-800 p-3 rounded-md">
                <div className="flex items-center">
                  <div className="mr-2">
                    {uploadedFiles.addressProof ? (
                      <Check className="text-green-500" />
                    ) : (
                      <AlertTriangle className="text-yellow-500" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">Address Proof</p>
                    <p className="text-xs text-gray-400">
                      {uploadedFiles.addressProof?.name || "Not uploaded"}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {errorMessage && (
            <div className="bg-red-900/30 border border-red-500 text-red-200 px-4 py-2 rounded-md">
              {errorMessage}
            </div>
          )}
        </div>
      );
    }

    // File upload steps
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium">{step.title}</h3>
        <p className="text-gray-400">{step.description}</p>

        <input
          type="file"
          className="hidden"
          onChange={(e) => handleFileChange(e, step.fileType!)}
          ref={
            step.fileType === "selfie"
              ? selfieInputRef
              : step.fileType === "idDocument"
              ? idDocumentInputRef
              : addressProofInputRef
          }
          accept={step.fileType === "selfie" ? "image/*" : "image/*,.pdf"}
        />

        {uploadedFiles[step.fileType!] ? (
          <div className="bg-gray-800 p-4 rounded-md">
            <div className="flex items-center">
              <Check className="h-5 w-5 text-green-500 mr-2" />
              <p className="text-sm">{uploadedFiles[step.fileType!]?.name}</p>
            </div>
            <Button
              variant="outline"
              className="mt-2 w-full"
              onClick={() => handleFileUploadClick(step.fileType!)}
            >
              Change File
            </Button>
          </div>
        ) : (
          <Button
            className="w-full h-32 border-dashed border-2 border-gray-600 flex flex-col items-center justify-center bg-gray-800/50"
            variant="outline"
            onClick={() => handleFileUploadClick(step.fileType!)}
          >
            <Upload className="h-8 w-8 mb-2" />
            <span>Click to upload</span>
          </Button>
        )}

        {errorMessage && (
          <div className="bg-red-900/30 border border-red-500 text-red-200 px-4 py-2 rounded-md">
            {errorMessage}
          </div>
        )}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Shield className="mr-2 h-5 w-5" />
          KYC Verification
        </CardTitle>
      </CardHeader>
      <CardContent>
        {verificationStatus ? (
          <div className="space-y-4">
            <div className="bg-gray-800 p-4 rounded-md">
              <div className="flex items-center mb-2">
                {verificationStatus === "verified" ? (
                  <Check className="h-6 w-6 text-green-500 mr-2" />
                ) : verificationStatus === "pending" ? (
                  <div className="animate-pulse h-6 w-6 bg-yellow-500 rounded-full mr-2"></div>
                ) : (
                  <AlertTriangle className="h-6 w-6 text-yellow-500 mr-2" />
                )}
                <h3 className="text-lg font-semibold">
                  Verification Status:{" "}
                  {verificationStatus.charAt(0).toUpperCase() +
                    verificationStatus.slice(1)}
                </h3>
              </div>

              {verificationDetails && (
                <div className="space-y-2 mt-4">
                  <p className="text-sm text-gray-400">Verification Details:</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      ID Verified: {verificationDetails.id_verified ? "✓" : "✗"}
                    </div>
                    <div>
                      Selfie Verified:{" "}
                      {verificationDetails.selfie_verified ? "✓" : "✗"}
                    </div>
                    <div>
                      Address Verified:{" "}
                      {verificationDetails.address_verified ? "✓" : "✗"}
                    </div>
                    {verificationDetails.blockchain_proof && (
                      <div className="col-span-2">
                        <span className="text-xs text-gray-400">
                          Blockchain Proof:
                        </span>
                        <div className="font-mono text-xs break-all">
                          {verificationDetails.blockchain_proof}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {verificationStatus !== "verified" && (
              <Button
                className="w-full"
                onClick={() => setVerificationStatus(null)}
              >
                Complete Verification
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="mb-6">
              <div className="flex justify-between mb-2 text-sm">
                <span>
                  Step {currentStep + 1} of {steps.length}
                </span>
                <span>
                  {Math.round(((currentStep + 1) / steps.length) * 100)}%
                  Complete
                </span>
              </div>
              <Progress value={((currentStep + 1) / steps.length) * 100} />
            </div>

            {renderStepContent()}
          </>
        )}
      </CardContent>

      {!verificationStatus && (
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePreviousStep}
            disabled={currentStep === 0 || isSubmitting}
          >
            Previous
          </Button>

          {currentStep < steps.length - 1 ? (
            <Button
              onClick={handleNextStep}
              disabled={
                currentStep === 0
                  ? false
                  : (currentStep > 0 &&
                      !uploadedFiles[steps[currentStep].fileType!]) ||
                    isSubmitting
              }
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={
                (selectedVerificationLevel === "basic" &&
                  !uploadedFiles.selfie) ||
                (selectedVerificationLevel === "standard" &&
                  (!uploadedFiles.selfie || !uploadedFiles.idDocument)) ||
                (selectedVerificationLevel === "advanced" &&
                  (!uploadedFiles.selfie ||
                    !uploadedFiles.idDocument ||
                    !uploadedFiles.addressProof)) ||
                isSubmitting
              }
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Submitting...
                </>
              ) : (
                "Submit Verification"
              )}
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
};

export default KYCVerification;
