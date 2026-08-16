plugins {
    id("com.android.application")
}

android {
    namespace = "com.sahid040601.catatanceklissuara"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.sahid040601.catatanceklissuara"
        minSdk = 23
        targetSdk = 35
        versionCode = 1
        versionName = "1.0"
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
}
