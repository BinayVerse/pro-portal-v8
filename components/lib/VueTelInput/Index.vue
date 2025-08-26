<script setup lang="ts">
import { VueTelInput } from "vue-tel-input";
import "vue-tel-input/vue-tel-input.css";

// Props
const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  placeholder: "Enter your phone number",
  defaultCountry: "us",
});

interface Props {
  disabled?: boolean;
  placeholder?: string;
  defaultCountry?: string;
}

interface PhoneNumber {
  country?: {
    dialCode: string;
    name: string;
    iso2: string;
  };
  countryCallingCode?: string;
  countryCode?: string;
  formatted?: string;
  nationalNumber?: string;
  number?: string;
  valid?: boolean;
}

// Local State
const phone = ref<string>("");
const phoneData = ref<PhoneNumber>({});
const phoneErr = ref<boolean>(false);
const phoneErrMsg = ref<string>("");

// Methods
function onPhoneInput(_phoneNumber: string, payload: PhoneNumber) {
  phoneData.value = payload;
  phone.value = _phoneNumber;
}

function handlePhoneValidation(forced = false) {
  if (!phone.value) {
    if (forced) {
      phoneErr.value = true;
      phoneErrMsg.value = "Phone number is required";
    }
    return {
      status: false,
      message: "Phone number is required",
    };
  }

  if (!phoneData.value?.valid) {
    if (forced) {
      phoneErr.value = true;
      phoneErrMsg.value = "Please enter valid Mobile Number";
    }
    return {
      status: false,
      message: "Please enter valid Mobile Number",
    };
  }

  phoneErr.value = false;
  phoneErrMsg.value = "";

  return {
    status: true,
  };
}

function resetPhoneField() {
  phone.value = "";
  phoneErrMsg.value = "";
  phoneErr.value = false;
  phoneData.value = {};
}

defineExpose({
  phoneData,
  handlePhoneValidation,
  resetPhoneField,
});
</script>

<template>
  <div>
    <VueTelInput
      v-model="phone"
      mode="international"
      :default-country="props.defaultCountry"
      :auto-format="false"
      enabled-flags
      :disabled="props.disabled"
      :dropdown-options="{
        showDialCodeInList: true,
        showDialCodeInSelection: true,
        showFlags: true,
        showSearchBox: true,
      }"
      :input-options="{
        showDialCode: true,
        placeholder: props.placeholder,
      }"
      @on-input="onPhoneInput"
      @blur="handlePhoneValidation(true)"
    />
    <!-- Validation error field -->
    <div v-if="phoneErr">
      <p class="mt-2 text-red-500 dark:text-red-400 text-sm">
        {{ phoneErrMsg }}
      </p>
    </div>
  </div>
</template>

<style scoped>
.errorState {
  border: 1px solid red !important;
}
</style>
