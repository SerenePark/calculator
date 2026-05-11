/**
 * Stripe 공개 키 (프론트 OK)
 * 비밀 키(sk_)는 Netlify 환경 변수 STRIPE_SECRET_KEY 에만 넣으세요.
 */
window.STRIPE_PUBLISHABLE_KEY =
  "pk_test_51Ol2aSFvdwbjRSVAPjjCHPr7lcfwkcnLOIb6u2c59QD5g0TGO47NcjgtSuS1BMLtxveopp1lrvarTZdyOcz8raaY000l2kYQRE";

/** 5,000원 일회성 → 계산 결과(=) 5회 */
window.STRIPE_PRICE_PACK_5 = "price_1TVxEXFvdwbjRSVAwdGPdqgk";

/** 50,000원 월 구독 → 무제한 */
window.STRIPE_PRICE_SUB_MONTHLY = "price_1TVxG3FvdwbjRSVAf6no1Tx7";

/**
 * Netlify와 같은 도메인에 올리면 빈 문자열 그대로 두세요.
 * 로컬에서만 다른 포트를 쓸 때만 예: "http://localhost:8888"
 */
window.STRIPE_API_BASE = "";
