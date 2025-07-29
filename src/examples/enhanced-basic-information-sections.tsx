/*
 * Example: Enhanced Basic Information Form Section
 * This demonstrates how to apply the form design improvements to the existing basic-information.tsx
 * Replace the corresponding section in basic-information.tsx with this enhanced version
 */

// Add these imports at the top of basic-information.tsx:
import {
  EnhancedSelect,
  EnhancedSelectContent,
  EnhancedSelectItem,
  EnhancedSelectTrigger,
  EnhancedSelectValue,
} from "../components/ui/enhanced-select";
import { EnhancedInput } from "../components/ui/enhanced-input";
import {
  FormField,
  FormSection,
  FormGrid,
  DisabledFieldHint,
} from "../components/ui/form-components";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../components/ui/card";
import { CheckCircle } from "lucide-react";

// Example form state management
const formData = {
  universityInCyprus: "",
  levelOfStudy: "",
  departmentInCyprus: "",
  currentYear: "",
  gpa: "",
  studentId: "",
  firstName: "",
  lastName: "",
  email: "",
  dateOfBirth: "",
  nationality: "",
  phoneNumber: "",
};

const fieldErrors = {
  universityInCyprus: "",
  levelOfStudy: "",
  departmentInCyprus: "",
  studentId: "",
  firstName: "",
  lastName: "",
  email: "",
  dateOfBirth: "",
  nationality: "",
};

const handleInputChange = (field: string, value: string) => {
  // This would update the form data in a real implementation
  console.log(`Field ${field} updated to ${value}`);
};

// Example data
const cyprusUniversities = [{ code: "ucy", name: "University of Cyprus" }];
const availableDepartments = ["Computer Science", "Engineering"];
const availableHostUniversities = [
  "University of Madrid",
  "Technical University of Munich",
];

// Replace the Academic Information section (around lines 720-800) with:

{
  /* Academic Information - Enhanced Version */
}
<Card>
  <CardHeader>
    <CardTitle>Academic Information</CardTitle>
  </CardHeader>
  <CardContent>
    <FormSection
      title="Cyprus University Details"
      subtitle="Your current academic institution and program"
    >
      <FormGrid columns={2}>
        <FormField
          label="Cyprus University"
          required
          error={fieldErrors.universityInCyprus}
          fieldId="universityInCyprus"
        >
          <EnhancedSelect
            value={formData.universityInCyprus || ""}
            onValueChange={(value) =>
              handleInputChange("universityInCyprus", value)
            }
          >
            <EnhancedSelectTrigger
              id="universityInCyprus"
              error={fieldErrors.universityInCyprus}
            >
              <EnhancedSelectValue placeholder="Select your university" />
            </EnhancedSelectTrigger>
            <EnhancedSelectContent>
              {cyprusUniversities.map((uni) => (
                <EnhancedSelectItem key={uni.code} value={uni.code}>
                  {uni.name}
                </EnhancedSelectItem>
              ))}
            </EnhancedSelectContent>
          </EnhancedSelect>
        </FormField>

        <FormField
          label="Level of Study"
          required
          error={fieldErrors.levelOfStudy}
          fieldId="levelOfStudy"
        >
          <EnhancedSelect
            value={formData.levelOfStudy || ""}
            onValueChange={(value) => handleInputChange("levelOfStudy", value)}
          >
            <EnhancedSelectTrigger
              id="levelOfStudy"
              error={fieldErrors.levelOfStudy}
            >
              <EnhancedSelectValue placeholder="Select level" />
            </EnhancedSelectTrigger>
            <EnhancedSelectContent>
              <EnhancedSelectItem value="bachelor">Bachelor</EnhancedSelectItem>
              <EnhancedSelectItem value="master">Master</EnhancedSelectItem>
              <EnhancedSelectItem value="phd">PhD</EnhancedSelectItem>
            </EnhancedSelectContent>
          </EnhancedSelect>
        </FormField>
      </FormGrid>

      <FormField
        label="Department"
        required
        error={fieldErrors.departmentInCyprus}
        fieldId="departmentInCyprus"
      >
        <EnhancedSelect
          value={formData.departmentInCyprus || ""}
          onValueChange={(value) =>
            handleInputChange("departmentInCyprus", value)
          }
          disabled={!formData.universityInCyprus}
        >
          <EnhancedSelectTrigger
            id="departmentInCyprus"
            disabled={!formData.universityInCyprus}
            error={fieldErrors.departmentInCyprus}
          >
            <EnhancedSelectValue
              placeholder={
                !formData.universityInCyprus
                  ? "Select university first"
                  : "Select your department"
              }
              disabledMessage="Select university first"
              disabled={!formData.universityInCyprus}
            />
          </EnhancedSelectTrigger>
          <EnhancedSelectContent>
            {availableDepartments.map((dept) => (
              <EnhancedSelectItem key={dept} value={dept}>
                {dept}
              </EnhancedSelectItem>
            ))}
          </EnhancedSelectContent>
        </EnhancedSelect>
        {!formData.universityInCyprus && (
          <DisabledFieldHint message="Choose your Cyprus university to see available departments" />
        )}
      </FormField>

      {/* Enhanced partnership info display */}
      {formData.departmentInCyprus && availableHostUniversities.length > 0 && (
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-green-800">
                Partnership Available
              </h4>
              <p className="text-sm text-green-700 mt-1">
                <span className="font-semibold">
                  {availableHostUniversities.length} partner universities
                </span>{" "}
                available for {formData.departmentInCyprus} at{" "}
                {
                  cyprusUniversities.find(
                    (u) => u.code === formData.universityInCyprus,
                  )?.name
                }
                {formData.levelOfStudy && ` (${formData.levelOfStudy} level)`}
              </p>
            </div>
          </div>
        </div>
      )}

      <FormGrid columns={3}>
        <FormField
          label="Current Year"
          fieldId="currentYear"
          helperText="Your current year of study"
        >
          <EnhancedInput
            id="currentYear"
            placeholder="e.g., 3rd year"
            value={formData.currentYear}
            onChange={(e) => handleInputChange("currentYear", e.target.value)}
          />
        </FormField>

        <FormField
          label="GPA"
          fieldId="gpa"
          helperText="Current grade point average"
        >
          <EnhancedInput
            id="gpa"
            type="number"
            step="0.01"
            placeholder="e.g., 3.5"
            value={formData.gpa}
            onChange={(e) => handleInputChange("gpa", e.target.value)}
          />
        </FormField>

        <FormField
          label="Student ID"
          required
          error={fieldErrors.studentId}
          fieldId="studentId"
        >
          <EnhancedInput
            id="studentId"
            placeholder="Your student ID"
            value={formData.studentId}
            onChange={(e) => handleInputChange("studentId", e.target.value)}
            error={fieldErrors.studentId}
          />
        </FormField>
      </FormGrid>
    </FormSection>
  </CardContent>
</Card>;

// Similarly, enhance the Personal Information section:

{
  /* Personal Information - Enhanced Version */
}
<Card>
  <CardHeader>
    <CardTitle>Personal Information</CardTitle>
  </CardHeader>
  <CardContent>
    <FormSection
      title="Basic Details"
      subtitle="Your personal information for the Erasmus application"
    >
      <FormGrid columns={2}>
        <FormField
          label="First Name"
          required
          error={fieldErrors.firstName}
          fieldId="firstName"
        >
          <EnhancedInput
            id="firstName"
            placeholder="Enter your first name"
            value={formData.firstName}
            onChange={(e) => handleInputChange("firstName", e.target.value)}
            error={fieldErrors.firstName}
          />
        </FormField>

        <FormField
          label="Last Name"
          required
          error={fieldErrors.lastName}
          fieldId="lastName"
        >
          <EnhancedInput
            id="lastName"
            placeholder="Enter your last name"
            value={formData.lastName}
            onChange={(e) => handleInputChange("lastName", e.target.value)}
            error={fieldErrors.lastName}
          />
        </FormField>
      </FormGrid>

      <FormField
        label="Email Address"
        required
        error={fieldErrors.email}
        helperText="We'll use this email for important updates about your Erasmus application"
        fieldId="email"
      >
        <EnhancedInput
          id="email"
          type="email"
          placeholder="your.email@example.com"
          value={formData.email}
          onChange={(e) => handleInputChange("email", e.target.value)}
          error={fieldErrors.email}
        />
      </FormField>

      <FormGrid columns={2}>
        <FormField
          label="Date of Birth"
          required
          error={fieldErrors.dateOfBirth}
          fieldId="dateOfBirth"
        >
          <EnhancedInput
            id="dateOfBirth"
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
            error={fieldErrors.dateOfBirth}
          />
        </FormField>

        <FormField
          label="Nationality"
          required
          error={fieldErrors.nationality}
          fieldId="nationality"
        >
          <EnhancedInput
            id="nationality"
            placeholder="e.g., Cypriot"
            value={formData.nationality}
            onChange={(e) => handleInputChange("nationality", e.target.value)}
            error={fieldErrors.nationality}
          />
        </FormField>
      </FormGrid>

      <FormField
        label="Phone Number"
        fieldId="phoneNumber"
        helperText="Include country code (e.g., +357 99 123456)"
      >
        <EnhancedInput
          id="phoneNumber"
          type="tel"
          placeholder="+357 99 123456"
          value={formData.phoneNumber}
          onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
        />
      </FormField>
    </FormSection>
  </CardContent>
</Card>;
