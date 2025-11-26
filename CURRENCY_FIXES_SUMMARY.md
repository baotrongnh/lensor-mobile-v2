# Mobile Currency & Discount Rate Fixes

## Issues Fixed

### 1. Checkout Currency Conversion (CRITICAL)

**Problem**: Checkout was converting prices with hardcoded exchange rate `* 25000`

- Product prices from API are already in VND
- Multiplying by 25000 made prices 25,000x too high
- Wallet balance showed USD format instead of VND

**Files Changed**:

- `mobile/app/checkout.tsx`

**Changes**:

- ✅ Removed `const totalVND = Math.round(activeTotal * 25000)` on line 62
- ✅ Changed Alert dialog to use `activeTotal` directly (line 60)
- ✅ Changed wallet balance from `$${balance.toFixed(2)}` to `{balance.toLocaleString('vi-VN')} ₫` (line 157)
- ✅ Fixed subtotal display (line 170)
- ✅ Fixed total display (line 176)
- ✅ Fixed checkout button text (line 208)

**Before**:

```tsx
const totalVND = Math.round(activeTotal * 25000);
Alert.alert(
  "Confirm Purchase",
  `Pay ${totalVND.toLocaleString("vi-VN")} ₫ with Wallet?`
);
// Balance: $123.45
// Total: 3,075,000 ₫ (when should be 123,000 ₫)
```

**After**:

```tsx
Alert.alert(
  "Confirm Purchase",
  `Pay ${activeTotal.toLocaleString("vi-VN")} ₫ with Wallet?`
);
// Balance: 123,000 ₫
// Total: 123,000 ₫ (correct!)
```

---

### 2. Sold Orders Discount Rate (CRITICAL)

**Problem**: Discount rate was hardcoded as `0.17` (17%)

- Backend controls discount rates via system variables
- Changes to discount rate wouldn't reflect in mobile app
- Inconsistent with web frontend

**Files Changed**:

- `mobile/app/sold-orders.tsx`
- `mobile/lib/api/systemApi.ts` (NEW)
- `mobile/lib/api/endpoints.ts`
- `mobile/lib/hooks/useDiscountRate.ts` (NEW)

**Changes**:

- ✅ Created `systemApi` with `getDiscountRate()` method
- ✅ Added `systemVariables.discountRate` endpoint
- ✅ Created `useDiscountRate()` hook (matches web implementation)
- ✅ Changed fee calculation from `totalSelectedAmount * 0.17` to `totalSelectedAmount * discountRateNum`
- ✅ Changed display from "Platform Fee (17%)" to dynamic "Platform Fee ({Math.round(discountRateNum \* 100)}%)"

**Before**:

```tsx
const fee = totalSelectedAmount * 0.17; // Hardcoded 17%
<Text>Platform Fee (17%):</Text>;
```

**After**:

```tsx
const { discountRate, discountRateNum } = useDiscountRate();
const fee = totalSelectedAmount * discountRateNum; // From API
<Text>Platform Fee ({Math.round(discountRateNum * 100)}%):</Text>;
```

---

## New Files Created

### 1. `mobile/lib/api/systemApi.ts`

```typescript
export interface DiscountRateResponse {
  data: {
    discountRate: string;
  };
}

export const systemApi = {
  getDiscountRate: async (): Promise<DiscountRateResponse> => {
    const response = await apiClient.get(
      endpoints.systemVariables.discountRate
    );
    return response.data;
  },
};
```

### 2. `mobile/lib/hooks/useDiscountRate.ts`

```typescript
export const useDiscountRate = () => {
  const [discountRate, setDiscountRate] = useState<string>("0");
  const [discountRateNum, setDiscountRateNum] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetches discount rate on mount
  // Returns: discountRate (string), discountRateNum (number), isLoading, error, refresh()
};
```

---

## Verified Screens (Already Correct)

### ✅ Wallet Screen (`mobile/app/wallet.tsx`)

- Balance: `{balance.toLocaleString('vi-VN')} ₫`
- Transactions: `{parseFloat(transaction.amount).toLocaleString('vi-VN')} ₫`

### ✅ Cart Screen (`mobile/app/cart.tsx`)

- Subtotal: `{subtotal.toLocaleString('vi-VN')} ₫`
- Uses VND prices from API directly

### ✅ Product Details (`mobile/app/product-details/[id].tsx`)

- Price: `{item.price?.toLocaleString('vi-VN') || '0'} ₫`
- Original Price: `{item.originalPrice.toLocaleString('vi-VN')} ₫`

### ✅ Purchased Orders (`mobile/app/purchased-orders.tsx`)

- Total: `{parseFloat(order.totalAmount).toLocaleString('vi-VN')} ₫`
- Item Price: `{parseFloat(item.price).toLocaleString('vi-VN')} ₫`

---

## API Endpoints

### System Variables

- **Endpoint**: `GET /system-variables/discount-rate`
- **Response**:

```json
{
  "data": {
    "discountRate": "0.17"
  }
}
```

---

## Testing Checklist

### Checkout Flow

- [ ] Add product to cart
- [ ] Navigate to checkout
- [ ] Verify wallet balance shows VND format (e.g., "123,000 ₫")
- [ ] Verify subtotal matches product prices (no 25000x multiplication)
- [ ] Verify total amount is correct
- [ ] Complete purchase and check wallet deduction

### Sold Orders

- [ ] View sold orders screen
- [ ] Check "Platform Fee" percentage displays dynamic value
- [ ] Select orders for withdrawal
- [ ] Verify fee calculation uses correct discount rate
- [ ] Verify net amount = total - (total \* discountRate)
- [ ] Complete withdrawal request

### Currency Display

- [ ] Check all screens show "₫" symbol
- [ ] Check all numbers use `toLocaleString('vi-VN')` format
- [ ] Verify no USD "$" symbols anywhere in mobile app

---

## Comparison with Web Frontend

### Web Implementation (Reference)

```typescript
// lensor-frontend/src/lib/hooks/useDiscountRate.ts
export const useDiscountRate = () => {
  const { data, isLoading, error, mutate } = useSWR(
    endpoints.systemVariables.discountRate,
    systemApi.getDiscountRate
  );
  const discountRate = data?.data?.discountRate || "0";
  const discountRateNum = parseFloat(discountRate);
  return { discountRate, discountRateNum, isLoading, error, mutate };
};
```

### Mobile Implementation (Now Matches!)

```typescript
// mobile/lib/hooks/useDiscountRate.ts
export const useDiscountRate = () => {
  // Uses useState + useEffect instead of SWR
  // Same return signature: { discountRate, discountRateNum, isLoading, error }
  // Added refresh() method for manual refetch
};
```

---

## Migration Notes

### Breaking Changes

None - these are bug fixes that restore correct behavior

### Backend Requirements

- Backend must have `/system-variables/discount-rate` endpoint
- Endpoint returns `{ data: { discountRate: "0.17" } }`

### Rollback Plan

If issues occur, revert these commits:

1. `systemApi.ts` and `useDiscountRate.ts` creation
2. `checkout.tsx` changes (restore `* 25000`)
3. `sold-orders.tsx` changes (restore `* 0.17`)

---

## Future Improvements

### Potential Enhancements

1. **Cache discount rate**: Mobile hook doesn't use SWR caching yet
2. **Real-time updates**: Consider WebSocket for discount rate changes
3. **Exchange rate API**: If USD/VND conversion needed, use real exchange rate API
4. **Currency selector**: Allow users to view prices in different currencies

### Code Quality

- All files follow existing patterns
- No new dependencies added
- TypeScript types properly defined
- Error handling implemented

---

## Related Files

### Modified

- `mobile/app/checkout.tsx`
- `mobile/app/sold-orders.tsx`
- `mobile/lib/api/endpoints.ts`

### Created

- `mobile/lib/api/systemApi.ts`
- `mobile/lib/hooks/useDiscountRate.ts`

### Verified (No Changes)

- `mobile/app/wallet.tsx`
- `mobile/app/cart.tsx`
- `mobile/app/product-details/[id].tsx`
- `mobile/app/purchased-orders.tsx`
- `mobile/types/marketplace.ts`

---

**Date**: January 2025  
**Status**: ✅ Complete  
**Tested**: Pending user verification
