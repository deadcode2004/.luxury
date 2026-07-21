# تقرير توحيد بيئة Local و Vercel

تاريخ الفحص: 2026-07-19

## الخلاصة

الفرق بين Local و Vercel ليس بسبب “ميزة ناقصة”، بل بسبب اختلاف إعدادات التشغيل/البناء + اعتماد الـ Frontend على عنوان API مطلق (`127.0.0.1`) + نشر Production قديم على Vercel.

| البيئة | التصميم | الوظائف |
|--------|---------|---------|
| Local (`npm run dev --webpack`) | صحيح (Webpack) | كثير منها يفشل إذا Laravel متوقف أو API يشير لـ localhost |
| Vercel Production | مشاكل بصرية محتملة (Turbopack build) | تبدو “تعمل” لأن UI القديم على `main` القديم (عدادات ثابتة، أزرار تنقّل) |

## المشاكل المكتشفة

### 1) Bundler غير موحّد (سبب اختلاف التصميم)
- Local: `package.json` يشغّل `next dev --webpack`
- Vercel / `next build`: Next.js 16 يستخدم **Turbopack افتراضياً**
- النتيجة: CSS/Tailwind/صور قد تختلف بين البيئتين

### 2) لا يوجد `.env` للـ Frontend
- لا يوجد `.env.example` في جذر Next.js
- `NEXT_PUBLIC_API_URL` غير موثّق
- الـ client كان fallback إلى `http://127.0.0.1:8000/api/v1` دائماً

### 3) روابط API مطلقة تكسر Production
- على Vercel، استدعاء `127.0.0.1:8000` من متصفح المستخدم يفشل دائماً
- CORS يصبح ضرورياً بلا داعٍ إذا استخدمنا same-origin proxy

### 4) CORS / Sanctum غير جاهزين لـ Vercel
- `FRONTEND_URL` و `SANCTUM_STATEFUL_DOMAINS` مضبوطان على localhost فقط
- لا دعم لقائمة origins متعددة (Preview URLs)

### 5) Auth يعتمد Bearer Token في localStorage
- هذا جيد عبر البيئات (لا اعتماد على cookies cross-site)
- لكن بدون API حي أو proxy صحيح، Login/Profile يفشلان محلياً/على Vercel

### 6) إعدادات الصور في Next
- استخدام `quality={90}` و `quality={100}` بدون `images.qualities` في `next.config`
- Next 16 يحذّر وقد يسيء معالجة الصور في Production

### 7) Vercel Production متأخر عن الكود الحالي
- آخر Production deploy تقريباً على commit قديم من `main` (منتصف يوليو)
- Preview deployments للفروع الجديدة موجودة، لكن Production لم يُحدَّث
- على `main`: عدادات السلة/المفضلة **hardcoded = 2** فتبدو الوظائف “تعمل”

### 8) Laravel المحلي كان يعيد 500
- عملية `php artisan serve` علقت وأعادت 500 فارغ حتى لـ `/up`
- بعد إعادة التشغيل: API يعمل (products + login)
- `public/storage` لم يكن linked

### 9) GitHub Pages مفعّل من `main`
- `https://deadcode2004.github.io/.luxury/` يبني من المصدر الخام وليس Next build
- قد يسبب التباساً إضافياً في “التصميم المكسور”

### 10) لا يوجد `vercel.json` يفرض نفس أمر البناء
- Vercel كان يشغّل `next build` (Turbopack) بينما Local يستخدم Webpack

## الإصلاحات المنفذة

1. توحيد bundler: `dev` و `build` على Webpack + `vercel.json`
2. `next.config.ts`: `images.qualities` + rewrite proxy لـ `/api/v1 → API_PROXY_ORIGIN`
3. API client: الافتراضي relative `/api/v1` (نفس السلوك Local/Vercel)
4. إضافة `.env.example` و `.env.local` للفرونت
5. توسيع CORS عبر `CORS_ALLOWED_ORIGINS` + تحديث `.env.example` للباكند
6. توثيق متغيرات Production وخطوات التحقق

## متغيرات البيئة المطلوبة

### Frontend (Vercel Project Settings)
```
NEXT_PUBLIC_API_URL=/api/v1
API_PROXY_ORIGIN=https://YOUR-LARAVEL-API-HOST
```

### Frontend (Local `.env.local`)
```
NEXT_PUBLIC_API_URL=/api/v1
API_PROXY_ORIGIN=http://127.0.0.1:8000
```

### Backend
```
APP_URL=https://YOUR-LARAVEL-API-HOST
FRONTEND_URL=https://luxury-khaki-eight.vercel.app
CORS_ALLOWED_ORIGINS=https://luxury-khaki-eight.vercel.app,http://localhost:3000,http://127.0.0.1:3000
SANCTUM_STATEFUL_DOMAINS=luxury-khaki-eight.vercel.app,localhost:3000,127.0.0.1:3000
```

## خطوات التحقق بعد الإصلاح

1. Local: `npm run dev` + `php artisan serve` → نفس التصميم + Login/Cart/Wishlist
2. Local production mode: `npm run build && npm run start` → يطابق شكل Vercel
3. Vercel Preview لهذا الفرع → نفس CSS + استدعاءات API عبر `/api/v1`
4. بعد الدمج: Redeploy Production من الفرع الصحيح وتعيين env vars
