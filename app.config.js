import 'dotenv/config';

const isProduction = process.env.APP_ENV === 'production';
const isHomolog = process.env.APP_ENV === 'homolog';

export default () => ({
  expo: {
    name: isHomolog ? "Enemax HML" : "Enemax",
    slug: "Enemax-DanmControllMobile",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "enemaxdanmcontrollmobile",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      "infoPlist": {
        "NSPhotoLibraryUsageDescription": "Permite selecionar arquivos para importar leituras."
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      edgeToEdgeEnabled: true,
      package: "com.EnemaxDanmControllMobile",
      "permissions": ["READ_EXTERNAL_STORAGE", "WRITE_EXTERNAL_STORAGE"],
      usesCleartextTraffic: true
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png"
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff"
        }
      ]
    ],
    experiments: {
      typedRoutes: true
    },
    extra: {
      API_URL: isProduction
        ? "http://192.168.100.4:5235/api"
        : isHomolog
          ? "http://192.168.100.4:5235/api"
          : "http://192.168.100.4:5235/api",
      // API_URL: isProduction
      //   ? "https://enemaxapi-production.up.railway.app/api"
      //   : isHomolog
      //     ? "https://enemaxapi-production.up.railway.app/api"
      //     : "https://enemaxapi-production.up.railway.app/api",
      ENV: isProduction ? "production" : isHomolog ? "homolog" : "development",
      eas: {
        projectId: "7e6cd094-139c-482f-bb43-634318d68b32"
      }
    }
  }
});
