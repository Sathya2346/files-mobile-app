import { Stack } from "expo-router";

export default function Layout() {
  return (
    <Stack>

      {/* Home page (index.tsx) - no header */}
      <Stack.Screen
        name="home/index"
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="index"
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="onboarding/index"
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="splash"
        options={{ headerShown: false }}
      />

      {/* Auth pages - no headers */}
      <Stack.Screen
        name="auth/login"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="auth/signup"
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="Explore"
        options={{ headerShown: false }}
      />

      <Stack.Screen
       name="RecentFiles" 
       options={{ headerShown: false }} 
      />


      {/* Tools pages with titles */}
      <Stack.Screen
        name="MergePdfScreen"
        options={{ headerShown: false }} 
      />
      <Stack.Screen
        name="CompressPdfScreen"
        options={{ headerShown: false }} 
      />
      <Stack.Screen
        name="SplitPdfScreen"
        options={{ headerShown: false }} 
      />
      <Stack.Screen
        name="PdfToWordScreen"
        options={{ headerShown: false }} 
      />
      <Stack.Screen
        name="WordToPdfScreen"
        options={{ headerShown: false }} 
      />
      <Stack.Screen
        name="ImageToPdfScreen"
        options={{ headerShown: false }} 
      />
      <Stack.Screen
        name="PdfToImagesScreen"
        options={{ headerShown: false }} 
      />
      <Stack.Screen
        name="ImageCompressScreen"
        options={{ headerShown: false }} 
      />
      <Stack.Screen
        name="ProtectPdfScreen"
        options={{ headerShown: false }} 
      />
      <Stack.Screen
        name="UnlockPdfScreen"
        options={{ headerShown: false }} 
      />
      <Stack.Screen
        name="PdfToPptScreen"
        options={{ headerShown: false }} 
      />
      <Stack.Screen
        name="PptToPdfScreen"
        options={{ headerShown: false }} 
      />
      <Stack.Screen
        name="PdfWatermarkScreen"
        options={{ headerShown: false }} 
      />
      <Stack.Screen
        name="PdfToExcelScreen"
        options={{ headerShown: false }} 
      />
      <Stack.Screen
        name="ExcelToPdfScreen"
        options={{ headerShown: false }} 
      />
      <Stack.Screen
        name="PdfSignScreen"
        options={{ headerShown: false }} 
      />

      <Stack.Screen
        name="Profile"
        options={{ title: "profile" }}
      />

      <Stack.Screen
        name="HelpSupport"
        options={{ title: "Help & Support" }}
      />

      <Stack.Screen
        name="TermsCondition"
        options={{ title: "Terms & Condition" }}
      />


    </Stack>
  );
}
