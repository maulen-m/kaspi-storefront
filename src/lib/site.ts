export const siteConfig = {
  brand: "ACMEWEAR",
  domain: import.meta.env.PUBLIC_SITE_DOMAIN ?? "https://acmewear.kz",
  supportEmail: import.meta.env.PUBLIC_SUPPORT_EMAIL ?? "support@acmewear.kz",
  supportPhone: import.meta.env.PUBLIC_SUPPORT_PHONE ?? "+7 (7XX) XXX-XX-XX",
  whatsappNumber: import.meta.env.PUBLIC_WHATSAPP_NUMBER ?? "77000000000",
  kaspiStoreUrl:
    import.meta.env.KASPI_STORE_URL ??
    import.meta.env.PUBLIC_KASPI_STORE_URL ??
    "https://kaspi.kz/shop/ACMEWEAR",
};

export const getWhatsappLink = () => `https://wa.me/${siteConfig.whatsappNumber}`;

export const getPhoneLink = () => `tel:${siteConfig.supportPhone.replace(/\s|\(|\)|-/g, "")}`;
