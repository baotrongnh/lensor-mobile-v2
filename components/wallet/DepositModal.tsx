import React, { useState, useRef } from 'react';
import {
     View,
     Text,
     Modal,
     StyleSheet,
     TouchableOpacity,
     TextInput,
     ActivityIndicator,
     Alert,
     KeyboardAvoidingView,
     Platform,
     ScrollView,
     SafeAreaView,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useTheme } from '@/contexts/ThemeContext';
import { X, CreditCard, Wallet, ArrowLeft } from 'lucide-react-native';
import { Spacing } from '@/constants/Colors';
import { paymentApi } from '@/lib/api/paymentApi';
import { useWalletStore } from '@/stores/walletStore';
import { logger } from '@/lib/utils/logger';

interface DepositModalProps {
     visible: boolean;
     onClose: () => void;
     onSuccess?: () => void;
}

export default function DepositModal({ visible, onClose, onSuccess }: DepositModalProps) {
     const { colors } = useTheme();
     const webViewRef = useRef<WebView>(null);
     const [amount, setAmount] = useState('');
     const [displayAmount, setDisplayAmount] = useState('');
     const [isLoading, setIsLoading] = useState(false);
     const [selectedMethod, setSelectedMethod] = useState<'paypal' | 'vnpay' | null>(null);

     // Payment WebView state
     const [showWebView, setShowWebView] = useState(false);
     const [paymentUrl, setPaymentUrl] = useState('');
     const [paymentMethod, setPaymentMethod] = useState<'paypal' | 'vnpay'>('vnpay');
     const [webViewLoading, setWebViewLoading] = useState(true);
     const [verifying, setVerifying] = useState(false);

     const formatCurrency = (value: string): string => {
          const numericValue = value.replace(/\D/g, '');
          if (!numericValue) return '';
          return Number(numericValue).toLocaleString('vi-VN');
     };

     const handleAmountChange = (text: string) => {
          const rawValue = text.replace(/\D/g, '');
          setAmount(rawValue);
          setDisplayAmount(formatCurrency(rawValue));
     };

     const handleDeposit = async (method: 'paypal' | 'vnpay') => {
          if (!amount || Number(amount) <= 0) {
               Alert.alert('Invalid Amount', 'Please enter a valid amount');
               return;
          }

          if (Number(amount) < 5000) {
               Alert.alert('Amount Too Low', 'Minimum deposit is 5,000 VNĐ');
               return;
          }

          setIsLoading(true);
          try {
               const amountNumber = Number(amount);
               const orderInfo = `Deposit_${amountNumber.toLocaleString('vi-VN')}_VND_to_Lensor_wallet`;
               let result;

               logger.log('═══════════════════════════════════════════════════');
               logger.log('💰 DEPOSIT REQUEST');
               logger.log('═══════════════════════════════════════════════════');
               logger.log('💵 Amount:', amountNumber, 'VNĐ');
               logger.log('🏦 Method:', method.toUpperCase());
               logger.log('📝 Order Info:', orderInfo);
               logger.log('═══════════════════════════════════════════════════');

               if (method === 'paypal') {
                    logger.log('📤 Calling PayPal API...');
                    result = await paymentApi.createPaypal(amountNumber, orderInfo, false);
                    logger.log('📥 PayPal Response:', JSON.stringify(result, null, 2));

                    if (result?.data?.url) {
                         logger.log('🌐 Opening PayPal in WebView');
                         setPaymentUrl(result.data.url);
                         setPaymentMethod('paypal');
                         setShowWebView(true);
                    }
               } else {
                    logger.log('📤 Calling VNPay API...');
                    result = await paymentApi.createVnpay(amountNumber, orderInfo, false);
                    logger.log('📥 VNPay Response:', JSON.stringify(result, null, 2));

                    if (result?.data?.paymentUrl) {
                         logger.log('🌐 Opening VNPay in WebView');
                         setPaymentUrl(result.data.paymentUrl);
                         setPaymentMethod('vnpay');
                         setShowWebView(true);
                    }
               }

               logger.log('═══════════════════════════════════════════════════');

               if (onSuccess) {
                    onSuccess();
               }
          } catch (error) {
               logger.error('Error creating payment:', error);
               Alert.alert('Payment Failed', 'Please try again later');
          } finally {
               setIsLoading(false);
          }
     };

     const handleWebViewNavigationStateChange = async (navState: any) => {
          const { url } = navState;
          logger.log('📍 WebView Navigation:', url);

          // Check if this is a callback URL
          if (
               url.includes('vnp_ResponseCode') ||
               url.includes('vnp_TransactionStatus') ||
               url.includes('paymentId') ||
               url.includes('payment/success') ||
               url.includes('payment/cancel')
          ) {
               logger.log('✅ Detected payment callback URL');
               setVerifying(true);

               try {
                    // Parse query parameters from URL
                    const urlObj = new URL(url);
                    const params: Record<string, string> = {};

                    urlObj.searchParams.forEach((value, key) => {
                         params[key] = value;
                    });

                    logger.log('📋 Callback Params:', JSON.stringify(params, null, 2));

                    // Verify payment with backend
                    const result = await paymentApi.vnpayCallback(params);
                    logger.log('📥 Backend Response:', JSON.stringify(result, null, 2));

                    if (result?.data?.success) {
                         logger.log('✅ Payment successful, refreshing wallet...');

                         // Close WebView first
                         setShowWebView(false);
                         setVerifying(false);

                         // Small delay to let WebView close smoothly
                         setTimeout(async () => {
                              try {
                                   // Refresh wallet balance
                                   await useWalletStore.getState().fetchBalance();

                                   // Reset form states
                                   setPaymentUrl('');
                                   setAmount('');
                                   setDisplayAmount('');
                                   setSelectedMethod(null);

                                   // Show success message
                                   Alert.alert(
                                        'Payment Successful! 🎉',
                                        'Your wallet has been topped up successfully.',
                                        [
                                             {
                                                  text: 'OK',
                                                  onPress: () => {
                                                       // Close main modal
                                                       onClose();
                                                       // Trigger parent refresh
                                                       if (onSuccess) {
                                                            onSuccess();
                                                       }
                                                  }
                                             }
                                        ]
                                   );
                              } catch (error) {
                                   logger.error('Error in success handler:', error);
                                   Alert.alert('Warning', 'Payment successful but failed to refresh balance. Please refresh manually.');
                                   onClose();
                              }
                         }, 300);
                    } else {
                         logger.log('❌ Payment failed');
                         setShowWebView(false);
                         setVerifying(false);

                         setTimeout(() => {
                              Alert.alert(
                                   'Payment Failed',
                                   result?.data?.message || 'Payment verification failed. Please try again.',
                                   [
                                        {
                                             text: 'Try Again',
                                             onPress: () => {
                                                  // Reset to allow retry
                                                  setPaymentUrl('');
                                                  setSelectedMethod(null);
                                             }
                                        },
                                        {
                                             text: 'Cancel',
                                             style: 'cancel',
                                             onPress: () => onClose()
                                        }
                                   ]
                              );
                         }, 300);
                    }
               } catch (error) {
                    logger.error('❌ Payment verification error:', error);
                    setShowWebView(false);
                    setVerifying(false);

                    setTimeout(() => {
                         Alert.alert(
                              'Error',
                              'An error occurred while verifying payment. Please check your wallet or contact support.',
                              [
                                   { text: 'OK', onPress: () => onClose() }
                              ]
                         );
                    }, 300);
               }
          }
     };

     const handleCloseWebView = () => {
          if (!verifying) {
               Alert.alert(
                    'Cancel Payment?',
                    'Are you sure you want to cancel this payment?',
                    [
                         {
                              text: 'No, Continue',
                              style: 'cancel'
                         },
                         {
                              text: 'Yes, Cancel',
                              style: 'destructive',
                              onPress: () => {
                                   setShowWebView(false);
                                   setPaymentUrl('');
                                   setPaymentMethod('vnpay');
                                   setSelectedMethod(null);
                              }
                         }
                    ]
               );
          }
     };

     const handleClose = () => {
          if (!isLoading && !showWebView) {
               setAmount('');
               setDisplayAmount('');
               setSelectedMethod(null);
               onClose();
          }
     };

     return (
          <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
               <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.overlay}
               >
                    <TouchableOpacity
                         style={styles.overlayTouch}
                         activeOpacity={1}
                         onPress={handleClose}
                    >
                         <TouchableOpacity
                              activeOpacity={1}
                              onPress={(e) => e.stopPropagation()}
                              style={[styles.container, { backgroundColor: colors.card }]}
                         >
                              {/* Header */}
                              <View style={[styles.header, { borderBottomColor: colors.border }]}>
                                   <Text style={[styles.title, { color: colors.foreground }]}>Deposit Money</Text>
                                   <TouchableOpacity onPress={handleClose} disabled={isLoading} style={styles.closeBtn}>
                                        <X size={24} color={colors.foreground} />
                                   </TouchableOpacity>
                              </View>

                              {/* Content */}
                              <ScrollView
                                   style={styles.content}
                                   contentContainerStyle={styles.contentContainer}
                                   keyboardShouldPersistTaps="handled"
                                   showsVerticalScrollIndicator={false}
                              >
                                   <Text style={[styles.description, { color: colors.mutedForeground }]}>
                                        Choose a payment method and enter the amount you want to deposit
                                   </Text>

                                   {/* Amount Input */}
                                   <View style={styles.section}>
                                        <Text style={[styles.label, { color: colors.foreground }]}>Amount (VNĐ)</Text>
                                        <TextInput
                                             style={[
                                                  styles.input,
                                                  {
                                                       backgroundColor: colors.background,
                                                       color: colors.foreground,
                                                       borderColor: colors.border,
                                                  },
                                             ]}
                                             placeholder="Enter amount"
                                             placeholderTextColor={colors.mutedForeground}
                                             value={displayAmount}
                                             onChangeText={handleAmountChange}
                                             keyboardType="numeric"
                                             editable={!isLoading}
                                        />
                                        <Text style={[styles.hint, { color: colors.mutedForeground }]}>
                                             Minimum: 5,000 VNĐ
                                        </Text>
                                   </View>

                                   {/* Payment Methods */}
                                   <View style={styles.section}>
                                        <Text style={[styles.label, { color: colors.foreground }]}>Payment Method</Text>
                                        <View style={styles.methodsContainer}>
                                             <TouchableOpacity
                                                  style={[
                                                       styles.methodBtn,
                                                       {
                                                            backgroundColor:
                                                                 selectedMethod === 'paypal'
                                                                      ? colors.primary + '20'
                                                                      : colors.background,
                                                            borderColor:
                                                                 selectedMethod === 'paypal' ? colors.primary : colors.border,
                                                       },
                                                  ]}
                                                  onPress={() => setSelectedMethod('paypal')}
                                                  disabled={isLoading}
                                             >
                                                  <CreditCard
                                                       size={32}
                                                       color={selectedMethod === 'paypal' ? colors.primary : colors.foreground}
                                                  />
                                                  <Text
                                                       style={[
                                                            styles.methodText,
                                                            {
                                                                 color:
                                                                      selectedMethod === 'paypal'
                                                                           ? colors.primary
                                                                           : colors.foreground,
                                                            },
                                                       ]}
                                                  >
                                                       PayPal
                                                  </Text>
                                             </TouchableOpacity>

                                             <TouchableOpacity
                                                  style={[
                                                       styles.methodBtn,
                                                       {
                                                            backgroundColor:
                                                                 selectedMethod === 'vnpay'
                                                                      ? colors.primary + '20'
                                                                      : colors.background,
                                                            borderColor:
                                                                 selectedMethod === 'vnpay' ? colors.primary : colors.border,
                                                       },
                                                  ]}
                                                  onPress={() => setSelectedMethod('vnpay')}
                                                  disabled={isLoading}
                                             >
                                                  <Wallet
                                                       size={32}
                                                       color={selectedMethod === 'vnpay' ? colors.primary : colors.foreground}
                                                  />
                                                  <Text
                                                       style={[
                                                            styles.methodText,
                                                            {
                                                                 color:
                                                                      selectedMethod === 'vnpay'
                                                                           ? colors.primary
                                                                           : colors.foreground,
                                                            },
                                                       ]}
                                                  >
                                                       VNPay
                                                  </Text>
                                             </TouchableOpacity>
                                        </View>
                                   </View>

                                   {/* Submit Button */}
                                   <TouchableOpacity
                                        style={[
                                             styles.submitBtn,
                                             {
                                                  backgroundColor:
                                                       isLoading || !selectedMethod || !amount
                                                            ? colors.mutedForeground
                                                            : colors.primary,
                                             },
                                        ]}
                                        onPress={() => selectedMethod && handleDeposit(selectedMethod)}
                                        disabled={isLoading || !selectedMethod || !amount}
                                   >
                                        {isLoading ? (
                                             <ActivityIndicator color="#fff" />
                                        ) : (
                                             <Text style={styles.submitText}>Continue to Payment</Text>
                                        )}
                                   </TouchableOpacity>
                              </ScrollView>
                         </TouchableOpacity>
                    </TouchableOpacity>
               </KeyboardAvoidingView>

               {/* Payment WebView Modal */}
               <Modal visible={showWebView} animationType="slide" onRequestClose={handleCloseWebView}>
                    <SafeAreaView style={[styles.webViewContainer, { backgroundColor: colors.background }]}>
                         {/* WebView Header */}
                         <View style={[styles.webViewHeader, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                              <TouchableOpacity
                                   style={styles.webViewBackBtn}
                                   onPress={handleCloseWebView}
                                   disabled={verifying}
                              >
                                   <ArrowLeft size={24} color={colors.foreground} />
                              </TouchableOpacity>
                              <Text style={[styles.webViewTitle, { color: colors.foreground }]}>
                                   {paymentMethod === 'vnpay' ? 'VNPay Payment' : 'PayPal Payment'}
                              </Text>
                              <View style={{ width: 40 }} />
                         </View>

                         {/* WebView */}
                         {paymentUrl ? (
                              <WebView
                                   ref={webViewRef}
                                   source={{ uri: paymentUrl }}
                                   onNavigationStateChange={handleWebViewNavigationStateChange}
                                   onLoadStart={() => setWebViewLoading(true)}
                                   onLoadEnd={() => setWebViewLoading(false)}
                                   style={styles.webView}
                                   javaScriptEnabled={true}
                                   domStorageEnabled={true}
                                   startInLoadingState={true}
                                   scalesPageToFit={true}
                              />
                         ) : null}

                         {/* WebView Loading */}
                         {(webViewLoading || verifying) && (
                              <View style={[styles.webViewLoading, { backgroundColor: colors.background }]}>
                                   <ActivityIndicator size="large" color={colors.primary} />
                                   <Text style={[styles.webViewLoadingText, { color: colors.foreground }]}>
                                        {verifying ? 'Verifying payment...' : 'Loading...'}
                                   </Text>
                              </View>
                         )}
                    </SafeAreaView>
               </Modal>
          </Modal>
     );
}

const styles = StyleSheet.create({
     overlay: {
          flex: 1,
          justifyContent: 'flex-end',
     },
     overlayTouch: {
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'flex-end',
     },
     container: {
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          maxHeight: '80%',
     },
     header: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: Spacing.lg,
          borderBottomWidth: 1,
     },
     title: {
          fontSize: 20,
          fontWeight: 'bold',
     },
     closeBtn: {
          padding: Spacing.xs,
     },
     content: {
          maxHeight: 500,
     },
     contentContainer: {
          padding: Spacing.lg,
          paddingBottom: Spacing.xl,
     },
     description: {
          fontSize: 14,
          marginBottom: Spacing.lg,
          lineHeight: 20,
     },
     section: {
          marginBottom: Spacing.lg,
     },
     label: {
          fontSize: 14,
          fontWeight: '600',
          marginBottom: Spacing.sm,
     },
     input: {
          height: 50,
          borderWidth: 1,
          borderRadius: 12,
          paddingHorizontal: Spacing.md,
          fontSize: 16,
     },
     hint: {
          fontSize: 12,
          marginTop: Spacing.xs,
     },
     methodsContainer: {
          flexDirection: 'row',
          gap: Spacing.md,
     },
     methodBtn: {
          flex: 1,
          height: 100,
          borderWidth: 2,
          borderRadius: 12,
          alignItems: 'center',
          justifyContent: 'center',
          gap: Spacing.sm,
     },
     methodText: {
          fontSize: 16,
          fontWeight: '600',
     },
     submitBtn: {
          height: 50,
          borderRadius: 12,
          alignItems: 'center',
          justifyContent: 'center',
     },
     submitText: {
          color: '#fff',
          fontSize: 16,
          fontWeight: '600',
     },
     // WebView styles
     webViewContainer: {
          flex: 1,
     },
     webViewHeader: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: Spacing.md,
          paddingVertical: Spacing.sm,
          borderBottomWidth: 1,
     },
     webViewBackBtn: {
          padding: Spacing.xs,
          width: 40,
     },
     webViewTitle: {
          fontSize: 16,
          fontWeight: '600',
     },
     webView: {
          flex: 1,
     },
     webViewLoading: {
          ...StyleSheet.absoluteFillObject,
          justifyContent: 'center',
          alignItems: 'center',
          opacity: 0.95,
     },
     webViewLoadingText: {
          marginTop: Spacing.md,
          fontSize: 14,
     },
});
