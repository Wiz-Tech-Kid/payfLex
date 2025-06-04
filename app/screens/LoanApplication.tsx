import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { ActivityIndicator, Alert, Button, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import RNPickerSelect from "react-native-picker-select";

// Types
type LoanAppResult = {
  autoApproved: boolean;
  loan: {
    amount: string;
    interestRate: number;
    monthlyPayment: number;
    termMonths: number;
  };
};

type ApplicationForm = {
  amount: string;
  purpose: string;
  termMonths: number;
  monthlyIncome: string;
  employmentStatus: string;
};

// Mock API request (replace with your real API call)
const apiRequest = async (
  method: string,
  url: string,
  data: ApplicationForm
): Promise<{ json: () => LoanAppResult }> => {
  await new Promise((resolve) => setTimeout(resolve, 1200));
  return {
    json: () => ({
      autoApproved: Number(data.amount) < 1000000,
      loan: {
        amount: data.amount,
        interestRate: 10,
        monthlyPayment: (parseFloat(data.amount) / data.termMonths) * 1.1,
        termMonths: data.termMonths,
      },
    }),
  };
};

export default function LoanApplication() {
  const navigation = useNavigation<any>();
  const queryClient = useQueryClient();
  const [applicationResult, setApplicationResult] = useState<LoanAppResult | null>(null);

  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<ApplicationForm>({
    defaultValues: {
      amount: "",
      purpose: "auto",
      termMonths: 24,
      monthlyIncome: "",
      employmentStatus: "",
    },
  });

  // Mutation for submitting loan application
  const applicationMutation = useMutation({
    mutationFn: async (data: ApplicationForm) => {
      const response = await apiRequest("POST", "/api/loan-applications", data);
      return response.json();
    },
    onSuccess: (result: LoanAppResult) => {
      setApplicationResult(result);
      queryClient.invalidateQueries({ queryKey: ["/api/loans"] });
      queryClient.invalidateQueries({ queryKey: ["/api/loan-applications"] });
      Alert.alert(
        result.autoApproved ? "Loan Approved!" : "Application Submitted",
        result.autoApproved
          ? `Your loan of ₦${parseFloat(result.loan.amount).toLocaleString()} has been approved!`
          : "Your loan application is under review."
      );
    },
    onError: (error: any) => {
      Alert.alert("Application Failed", error.message || "Failed to submit application");
    },
  });

  // Submit handler
  const onSubmit = (data: ApplicationForm) => {
    applicationMutation.mutate(data);
  };

  if (applicationResult) {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <View style={{ padding: 20 }}>
          <TouchableOpacity style={{ marginBottom: 20 }} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <View style={styles.resultCard}>
            <View style={[
              styles.resultIcon,
              { backgroundColor: applicationResult.autoApproved ? "#dafbe1" : "#fffbe6" }
            ]}>
              {applicationResult.autoApproved ? (
                <Ionicons name="checkmark-circle" size={48} color="#22c55e" />
              ) : (
                <MaterialCommunityIcons name="car" size={48} color="#fbbf24" />
              )}
            </View>
            <Text style={styles.resultTitle}>
              {applicationResult.autoApproved ? "Loan Approved!" : "Under Review"}
            </Text>
            <Text style={styles.resultText}>
              {applicationResult.autoApproved
                ? `Your loan of ₦${parseFloat(applicationResult.loan.amount).toLocaleString()} has been approved instantly.`
                : "Your application is being reviewed. You'll be notified within 24 hours."
              }
            </Text>
            {applicationResult.autoApproved && (
              <View style={styles.detailsBox}>
                <Text>Loan Amount: ₦{parseFloat(applicationResult.loan.amount).toLocaleString()}</Text>
                <Text>Interest Rate: {applicationResult.loan.interestRate}%</Text>
                <Text>Monthly Payment: ₦{applicationResult.loan.monthlyPayment.toLocaleString()}</Text>
                <Text>Term: {applicationResult.loan.termMonths} months</Text>
              </View>
            )}
          </View>
          <Button title="Back to Home" onPress={() => navigation.navigate("Home")} />
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={{ padding: 20 }}>
        <TouchableOpacity style={{ marginBottom: 20 }} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.heading}>Loan Application</Text>

        <View style={styles.card}>
          <Text style={styles.label}>Loan Amount (₦)</Text>
          <Controller
            control={control}
            name="amount"
            rules={{ required: "Amount is required" }}
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                placeholder="500000"
                value={value}
                onChangeText={onChange}
              />
            )}
          />
          {errors.amount && <Text style={styles.error}>{errors.amount.message}</Text>}

          <Text style={styles.label}>Loan Purpose</Text>
          <Controller
            control={control}
            name="purpose"
            render={({ field: { onChange, value } }) => (
              <RNPickerSelect
                value={value}
                onValueChange={onChange}
                items={[
                  { label: "Auto/Vehicle", value: "auto" },
                  { label: "Business", value: "business" },
                  { label: "Personal", value: "personal" }
                ]}
                style={pickerSelectStyles}
              />
            )}
          />

          <Text style={styles.label}>Repayment Period</Text>
          <Controller
            control={control}
            name="termMonths"
            render={({ field: { onChange, value } }) => (
              <RNPickerSelect
                value={value}
                onValueChange={onChange}
                items={[
                  { label: "6 months", value: 6 },
                  { label: "12 months", value: 12 },
                  { label: "18 months", value: 18 },
                  { label: "24 months", value: 24 },
                  { label: "36 months", value: 36 },
                  { label: "48 months", value: 48 },
                  { label: "60 months", value: 60 }
                ]}
                style={pickerSelectStyles}
              />
            )}
          />

          <Text style={styles.label}>Monthly Income (₦)</Text>
          <Controller
            control={control}
            name="monthlyIncome"
            rules={{ required: "Monthly income is required" }}
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                placeholder="200000"
                value={value}
                onChangeText={onChange}
              />
            )}
          />
          {errors.monthlyIncome && <Text style={styles.error}>{errors.monthlyIncome.message}</Text>}

          <Text style={styles.label}>Employment Status</Text>
          <Controller
            control={control}
            name="employmentStatus"
            rules={{ required: "Employment status is required" }}
            render={({ field: { onChange, value } }) => (
              <RNPickerSelect
                value={value}
                onValueChange={onChange}
                items={[
                  { label: "Employed", value: "employed" },
                  { label: "Self Employed", value: "self_employed" },
                  { label: "Business Owner", value: "business_owner" },
                  { label: "Freelancer", value: "freelancer" },
                  { label: "Unemployed", value: "unemployed" }
                ]}
                style={pickerSelectStyles}
                placeholder={{ label: "Select employment status", value: "" }}
              />
            )}
          />
          {errors.employmentStatus && <Text style={styles.error}>{errors.employmentStatus.message}</Text>}
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Instant Approval Available</Text>
          <Text style={styles.infoText}>
            Most applications are approved instantly. You'll know your result immediately after submission.
          </Text>
        </View>

        <Button
          title={applicationMutation.isPending ? "Processing..." : "Submit Application"}
          onPress={handleSubmit(onSubmit)}
          disabled={applicationMutation.isPending}
        />
        {applicationMutation.isPending && <ActivityIndicator style={{ marginTop: 10 }} />}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: "white" },
  heading: { fontSize: 24, fontWeight: "bold", marginBottom: 16 },
  card: { backgroundColor: "#f8fafc", borderRadius: 8, padding: 16, marginBottom: 16 },
  label: { fontWeight: "500", marginTop: 8 },
  input: { borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 4, padding: 8, marginTop: 4, backgroundColor: "#fff" },
  error: { color: "red", fontSize: 12, marginTop: 2 },
  infoBox: { backgroundColor: "#e0e7ff", borderRadius: 8, padding: 12, marginBottom: 16 },
  infoTitle: { fontWeight: "bold", marginBottom: 4, color: "#3730a3" },
  infoText: { color: "#3730a3" },
  resultCard: { backgroundColor: "#f8fafc", borderRadius: 8, padding: 24, alignItems: "center", marginBottom: 24 },
  resultIcon: { width: 64, height: 64, borderRadius: 32, alignItems: "center", justifyContent: "center", marginBottom: 12 },
  resultTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 8 },
  resultText: { color: "#4b5563", marginBottom: 8 },
  detailsBox: { backgroundColor: "#f3f4f6", borderRadius: 8, padding: 12, marginBottom: 16, width: "100%" },
});

const pickerSelectStyles = {
  inputIOS: { borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 4, padding: 8, marginTop: 4, backgroundColor: "#fff" },
  inputAndroid: { borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 4, padding: 8, marginTop: 4, backgroundColor: "#fff" },
};