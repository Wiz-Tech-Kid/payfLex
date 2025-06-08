import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from 'expo-router';
import React, { useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import SidebarDrawer from '../../components/ui/SidebarDrawer';
import { Colors } from '../../constants/Colors';

const { width } = Dimensions.get('window');

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

type Step = {
  id: number;
  title: string;
  subtitle: string;
  icon: string;
};

const steps: Step[] = [
  { id: 1, title: "Loan Details", subtitle: "Amount & Purpose", icon: "cash-outline" },
  { id: 2, title: "Personal Info", subtitle: "Income & Employment", icon: "person-outline" },
  { id: 3, title: "Review", subtitle: "Confirm Details", icon: "checkmark-circle-outline" }
];

// Mock API request
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
   const router = useRouter();

  const { control, handleSubmit, formState: { errors }, watch, trigger } = useForm<ApplicationForm>({
    defaultValues: {
      amount: "",
      purpose: "auto",
      termMonths: 24,
      monthlyIncome: "",
      employmentStatus: "",
    },
  });

  const watchedFields = watch();

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
    },
    onError: (error: any) => {
      Alert.alert("Application Failed", error.message || "Failed to submit application");
    },
  });

  const animateStep = (direction: 'forward' | 'backward') => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: direction === 'forward' ? -20 : 20,
        duration: 150,
        useNativeDriver: true,
      })
    ]).start(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        })
      ]).start();
    });
  };

  const nextStep = async () => {
    let fieldsToValidate: (keyof ApplicationForm)[] = [];
    
    if (currentStep === 1) {
      fieldsToValidate = ['amount'];
    } else if (currentStep === 2) {
      fieldsToValidate = ['monthlyIncome', 'employmentStatus'];
    }

    const isValid = await trigger(fieldsToValidate);
    
    if (isValid && currentStep < 3) {
      animateStep('forward');
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      animateStep('backward');
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = (data: ApplicationForm) => {
    applicationMutation.mutate(data);
  };

  const getStepProgress = () => (currentStep / steps.length) * 100;

  const getPurposeIcon = (purpose: string) => {
    switch (purpose) {
      case 'auto': return 'car-outline';
      case 'business': return 'briefcase-outline';
      case 'personal': return 'person-outline';
      default: return 'cash-outline';
    }
  };

  const formatCurrency = (value: string) => {
    const num = parseFloat(value.replace(/,/g, ''));
    return isNaN(num) ? '0' : num.toLocaleString();
  };

  const handleSidebarNav = (route: string) => {
    setSidebarOpen(false);
    navigation.navigate(route);
  };

  const handleLogout = () => {
    setSidebarOpen(false);
  };

  // Success/Result Screen
  if (applicationResult) {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.content}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={Colors.light.text} />
          </TouchableOpacity>
          
          <View style={styles.resultContainer}>
            <Animated.View style={[
              styles.resultIconContainer,
              { backgroundColor: applicationResult.autoApproved ? "#e8f5e8" : "#fff7e6" }
            ]}>
              {applicationResult.autoApproved ? (
                <Ionicons name="checkmark-circle" size={64} color="#22c55e" />
              ) : (
                <Ionicons name="time-outline" size={64} color="#f59e0b" />
              )}
            </Animated.View>
            
            <Text style={styles.resultTitle}>
              {applicationResult.autoApproved ? "Congratulations!" : "Application Received"}
            </Text>
            
            <Text style={styles.resultSubtitle}>
              {applicationResult.autoApproved 
                ? "Your loan has been approved instantly"
                : "We're reviewing your application"
              }
            </Text>
            
            <View style={styles.resultCard}>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Loan Amount</Text>
                <Text style={styles.resultValue}>P{formatCurrency(applicationResult.loan.amount)}</Text>
              </View>
              
              {applicationResult.autoApproved && (
                <>
                  <View style={styles.resultRow}>
                    <Text style={styles.resultLabel}>Interest Rate</Text>
                    <Text style={styles.resultValue}>{applicationResult.loan.interestRate}% p.a.</Text>
                  </View>
                  <View style={styles.resultRow}>
                    <Text style={styles.resultLabel}>Monthly Payment</Text>
                    <Text style={styles.resultValue}>P{formatCurrency(applicationResult.loan.monthlyPayment.toString())}</Text>
                  </View>
                  <View style={styles.resultRow}>
                    <Text style={styles.resultLabel}>Loan Term</Text>
                    <Text style={styles.resultValue}>{applicationResult.loan.termMonths} months</Text>
                  </View>
                </>
              )}
              
              {!applicationResult.autoApproved && (
                <View style={styles.pendingInfo}>
                  <Ionicons name="information-circle-outline" size={20} color="#f59e0b" />
                  <Text style={styles.pendingText}>
                    You&#39;ll be notified within 24 hours about your application status.
                  </Text>
                </View>
              )}
            </View>
            
            <TouchableOpacity 
              style={styles.primaryButton} 
              onPress={() => router.push('/screens/HomeTabs')}
            >
              <Text style={styles.primaryButtonText}>Continue to Dashboard</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      <SidebarDrawer
        visible={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNavigate={handleSidebarNav}
        onLogout={handleLogout}
      />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.light.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Loan Application</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <Animated.View style={[styles.progressFill, { width: `${getStepProgress()}%` }]} />
        </View>
        <Text style={styles.progressText}>Step {currentStep} of {steps.length}</Text>
      </View>

      {/* Step Indicators */}
      <View style={styles.stepIndicators}>
        {steps.map((step) => (
          <View key={step.id} style={styles.stepIndicator}>
            <View style={[
              styles.stepCircle,
              currentStep >= step.id ? styles.stepCircleActive : styles.stepCircleInactive
            ]}>
              <Ionicons 
                name={step.icon as any} 
                size={16} 
                color={currentStep >= step.id ? "#fff" : "#9ca3af"} 
              />
            </View>
            <Text style={[
              styles.stepTitle,
              currentStep >= step.id ? styles.stepTitleActive : styles.stepTitleInactive
            ]}>
              {step.title}
            </Text>
            <Text style={styles.stepSubtitle}>{step.subtitle}</Text>
          </View>
        ))}
      </View>

      {/* Form Content */}
      <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
        <Animated.View 
          style={[
            styles.formContent,
            {
              opacity: fadeAnim,
              transform: [{ translateX: slideAnim }]
            }
          ]}
        >
          {/* Step 1: Loan Details */}
          {currentStep === 1 && (
            <View style={styles.stepContent}>
              <View style={styles.stepHeader}>
                <Ionicons name="cash-outline" size={24} color={Colors.light.tint} />
                <Text style={styles.stepHeaderTitle}>Loan Details</Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>How much do you need?</Text>
                <Controller
                  control={control}
                  name="amount"
                  rules={{ 
                    required: "Amount is required",
                    min: { value: 1000, message: "Minimum loan amount is P1,000" }
                  }}
                  render={({ field: { onChange, value } }) => (
                    <View style={styles.currencyInput}>
                      <Text style={styles.currencySymbol}>P</Text>
                      <TextInput
                        style={styles.amountInput}
                        keyboardType="numeric"
                        placeholder="500,000"
                        value={formatCurrency(value)}
                        onChangeText={(text) => onChange(text.replace(/,/g, ''))}
                      />
                    </View>
                  )}
                />
                {errors.amount && <Text style={styles.errorText}>{errors.amount.message}</Text>}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>What&#39;s it for?</Text>
                <Controller
                  control={control}
                  name="purpose"
                  render={({ field: { onChange, value } }) => (
                    <View style={styles.purposeOptions}>
                      {[
                        { label: "Auto/Vehicle", value: "auto", icon: "car-outline" },
                        { label: "Business", value: "business", icon: "briefcase-outline" },
                        { label: "Personal", value: "personal", icon: "person-outline" }
                      ].map((option) => (
                        <TouchableOpacity
                          key={option.value}
                          style={[
                            styles.purposeOption,
                            value === option.value && styles.purposeOptionActive
                          ]}
                          onPress={() => onChange(option.value)}
                        >
                          <Ionicons 
                            name={option.icon as any} 
                            size={24} 
                            color={value === option.value ? Colors.light.tint : "#9ca3af"} 
                          />
                          <Text style={[
                            styles.purposeOptionText,
                            value === option.value && styles.purposeOptionTextActive
                          ]}>
                            {option.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Repayment Period</Text>
                <Controller
                  control={control}
                  name="termMonths"
                  render={({ field: { onChange, value } }) => (
                    <View style={styles.termGrid}>
                      {[6, 12, 18, 24, 36, 48].map((months) => (
                        <TouchableOpacity
                          key={months}
                          style={[
                            styles.termOption,
                            value === months && styles.termOptionActive
                          ]}
                          onPress={() => onChange(months)}
                        >
                          <Text style={[
                            styles.termOptionText,
                            value === months && styles.termOptionTextActive
                          ]}>
                            {months}m
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                />
              </View>
            </View>
          )}

          {/* Step 2: Personal Information */}
          {currentStep === 2 && (
            <View style={styles.stepContent}>
              <View style={styles.stepHeader}>
                <Ionicons name="person-outline" size={24} color={Colors.light.tint} />
                <Text style={styles.stepHeaderTitle}>Personal Information</Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Monthly Income</Text>
                <Controller
                  control={control}
                  name="monthlyIncome"
                  rules={{ required: "Monthly income is required" }}
                  render={({ field: { onChange, value } }) => (
                    <View style={styles.currencyInput}>
                      <Text style={styles.currencySymbol}>P</Text>
                      <TextInput
                        style={styles.amountInput}
                        keyboardType="numeric"
                        placeholder="25,000"
                        value={formatCurrency(value)}
                        onChangeText={(text) => onChange(text.replace(/,/g, ''))}
                      />
                    </View>
                  )}
                />
                {errors.monthlyIncome && <Text style={styles.errorText}>{errors.monthlyIncome.message}</Text>}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Employment Status</Text>
                <Controller
                  control={control}
                  name="employmentStatus"
                  rules={{ required: "Employment status is required" }}
                  render={({ field: { onChange, value } }) => (
                    <View style={styles.employmentOptions}>
                      {[
                        { label: "Employed", value: "employed" },
                        { label: "Self Employed", value: "self_employed" },
                        { label: "Business Owner", value: "business_owner" },
                        { label: "Freelancer", value: "freelancer" }
                      ].map((option) => (
                        <TouchableOpacity
                          key={option.value}
                          style={[
                            styles.employmentOption,
                            value === option.value && styles.employmentOptionActive
                          ]}
                          onPress={() => onChange(option.value)}
                        >
                          <View style={[
                            styles.radioButton,
                            value === option.value && styles.radioButtonActive
                          ]}>
                            {value === option.value && (
                              <View style={styles.radioButtonInner} />
                            )}
                          </View>
                          <Text style={[
                            styles.employmentOptionText,
                            value === option.value && styles.employmentOptionTextActive
                          ]}>
                            {option.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                />
                {errors.employmentStatus && <Text style={styles.errorText}>{errors.employmentStatus.message}</Text>}
              </View>
            </View>
          )}

          {/* Step 3: Review */}
          {currentStep === 3 && (
            <View style={styles.stepContent}>
              <View style={styles.stepHeader}>
                <Ionicons name="checkmark-circle-outline" size={24} color={Colors.light.tint} />
                <Text style={styles.stepHeaderTitle}>Review Your Application</Text>
              </View>

              <View style={styles.reviewCard}>
                <View style={styles.reviewSection}>
                  <Text style={styles.reviewSectionTitle}>Loan Details</Text>
                  <View style={styles.reviewRow}>
                    <Ionicons name={getPurposeIcon(watchedFields.purpose) as any} size={20} color={Colors.light.tint} />
                    <View style={styles.reviewRowContent}>
                      <Text style={styles.reviewLabel}>Amount</Text>
                      <Text style={styles.reviewValue}>P{formatCurrency(watchedFields.amount)}</Text>
                    </View>
                  </View>
                  <View style={styles.reviewRow}>
                    <Ionicons name="time-outline" size={20} color={Colors.light.tint} />
                    <View style={styles.reviewRowContent}>
                      <Text style={styles.reviewLabel}>Term</Text>
                      <Text style={styles.reviewValue}>{watchedFields.termMonths} months</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.reviewSection}>
                  <Text style={styles.reviewSectionTitle}>Personal Information</Text>
                  <View style={styles.reviewRow}>
                    <Ionicons name="cash-outline" size={20} color={Colors.light.tint} />
                    <View style={styles.reviewRowContent}>
                      <Text style={styles.reviewLabel}>Monthly Income</Text>
                      <Text style={styles.reviewValue}>P{formatCurrency(watchedFields.monthlyIncome)}</Text>
                    </View>
                  </View>
                  <View style={styles.reviewRow}>
                    <Ionicons name="briefcase-outline" size={20} color={Colors.light.tint} />
                    <View style={styles.reviewRowContent}>
                      <Text style={styles.reviewLabel}>Employment</Text>
                      <Text style={styles.reviewValue}>
                        {watchedFields.employmentStatus.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              <View style={styles.instantApprovalBanner}>
                <Ionicons name="flash-outline" size={24} color="#f59e0b" />
                <View style={styles.bannerContent}>
                  <Text style={styles.bannerTitle}>Instant Approval Available</Text>
                  <Text style={styles.bannerText}>
                    Most applications are approved instantly. You&#39;ll know your result immediately.
                  </Text>
                </View>
              </View>
            </View>
          )}
        </Animated.View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={[styles.secondaryButton, currentStep === 1 && styles.buttonDisabled]}
          onPress={prevStep}
          disabled={currentStep === 1}
        >
          <Ionicons name="chevron-back" size={20} color={currentStep === 1 ? "#9ca3af" : Colors.light.tint} />
          <Text style={[styles.secondaryButtonText, currentStep === 1 && styles.buttonTextDisabled]}>
            Back
          </Text>
        </TouchableOpacity>

        {currentStep < 3 ? (
          <TouchableOpacity style={styles.primaryButton} onPress={nextStep}>
            <Text style={styles.primaryButtonText}>Next</Text>
            <Ionicons name="chevron-forward" size={20} color="#fff" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={[styles.primaryButton, applicationMutation.isPending && styles.buttonDisabled]}
            onPress={handleSubmit(onSubmit)}
            disabled={applicationMutation.isPending}
          >
            {applicationMutation.isPending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Text style={styles.primaryButtonText}>Submit Application</Text>
                <Ionicons name="checkmark" size={20} color="#fff" />
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#f3f4f6",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
  },
  placeholder: {
    width: 40,
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#fff",
  },
  progressBar: {
    height: 4,
    backgroundColor: "#e5e7eb",
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.light.tint,
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: "#6b7280",
    textAlign: 'center',
  },
  stepIndicators: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  stepIndicator: {
    alignItems: 'center',
    flex: 1,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  stepCircleActive: {
    backgroundColor: Colors.light.tint,
  },
  stepCircleInactive: {
    backgroundColor: "#e5e7eb",
  },
  stepTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  stepTitleActive: {
    color: Colors.light.tint,
  },
  stepTitleInactive: {
    color: "#9ca3af",
  },
  stepSubtitle: {
    fontSize: 10,
    color: "#9ca3af",
    textAlign: 'center',
  },
  formContainer: {
    flex: 1,
  },
  formContent: {
    padding: 20,
  },
  stepContent: {
    minHeight: 400,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  stepHeaderTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.light.text,
    marginLeft: 12,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 12,
  },
  currencyInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    paddingHorizontal: 16,
    height: 56,
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
  },
  purposeOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  purposeOption: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 4,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  purposeOptionActive: {
    borderColor: Colors.light.tint,
    backgroundColor: "#f0f9ff",
  },
  purposeOptionText: {
    fontSize: 12,
    color: "#9ca3af",
    marginTop: 8,
    textAlign: 'center',
  },
  purposeOptionTextActive: {
    color: Colors.light.tint,
    fontWeight: '600',
  },
  termGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  termOption: {
    width: '30%',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  termOptionActive: {
    borderColor: Colors.light.tint,
    backgroundColor: "#f0f9ff",
  },
  termOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: "#9ca3af",
  },
  termOptionTextActive: {
    color: Colors.light.tint,
  },
  employmentOptions: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 4,
  },
  employmentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
  },
  employmentOptionActive: {
    backgroundColor: "#f0f9ff",
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#e5e7eb",
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  radioButtonActive: {
    borderColor: Colors.light.tint,
  },
  radioButtonInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.light.tint,
  },
  employmentOptionText: {
    fontSize: 16,
    color: "#6b7280",
  },
  employmentOptionTextActive: {
    color: Colors.light.text,
    fontWeight: '600',
  },
  reviewCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  reviewSection: {
    marginBottom: 24,
  },
  reviewSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 16,
  },
  reviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  reviewRowContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginLeft: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  reviewLabel: {
    fontSize: 14,
    color: "#6b7280",
  },
  reviewValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
  },
  instantApprovalBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: "#fffbeb",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#fed7aa",
  },
  bannerContent: {
    flex: 1,
    marginLeft: 12,
  },
  bannerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: "#92400e",
    marginBottom: 4,
  },
  bannerText: {
    fontSize: 12,
    color: "#92400e",
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.tint,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    minWidth: 120,
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: '600',
    marginRight: 4,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    minWidth: 120,
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: Colors.light.tint,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 4,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonTextDisabled: {
    color: "#9ca3af",
  },
  errorText: {
    color: "#dc2626",
    fontSize: 12,
    marginTop: 4,
  },
  // Result Screen Styles
  resultContainer: {
    alignItems: 'center',
    paddingTop: 40,
  },
  resultIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  resultSubtitle: {
    fontSize: 16,
    color: "#6b7280",
    marginBottom: 32,
    textAlign: 'center',
  },
  resultCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    width: '100%',
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  resultLabel: {
    fontSize: 14,
    color: "#6b7280",
  },
  resultValue: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
  },
  pendingInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: "#fffbeb",
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  pendingText: {
    flex: 1,
    fontSize: 12,
    color: "#92400e",
    marginLeft: 8,
    lineHeight: 16,
  },
});