import { Link } from "react-router-dom";
import { MapPin, Phone, Mail } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";

export default function Footer() {
  const { settings } = useSiteSettings();

  return (
    <footer className="bg-muted py-12 mt-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-right">
          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">معلومات التواصل</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <Phone className="h-4 w-4 text-primary" />
                <a 
                  href={`tel:${settings.whatsapp_number || '+222 49055137'}`}
                  className="text-primary hover:underline"
                >
                  {settings.whatsapp_number || '+222 49055137'}
                </a>
              </div>
              <div className="flex items-center justify-center md:justify-start gap-2">
                <Mail className="h-4 w-4 text-primary" />
                <a 
                  href={`mailto:${settings.site_email || 'moubarakouhoussein@gmail.com'}`}
                  className="text-primary hover:underline"
                >
                  {settings.site_email || 'moubarakouhoussein@gmail.com'}
                </a>
              </div>
              <div className="flex items-center justify-center md:justify-start gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <a 
                  href={settings.map_link || 'https://maps.app.goo.gl/vE3k4Ts1shPzQmNd7'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {settings.contact_address || 'الموقع الجغرافي'}
                </a>
              </div>
            </div>
          </div>
          {/* Logo & Description */}
          <div>
            <h2 className="text-2xl font-bold text-primary mb-2">{settings.site_name || 'بنات'}</h2>
            <p className="text-muted-foreground mb-3">{settings.site_description || 'متجر للأزياء النسائية'}</p>
            {settings.footer_text && (
              <p className="text-sm text-muted-foreground">{settings.footer_text}</p>
            )}
          </div>
          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">روابط سريعة</h3>
            <div className="space-y-2">
              <div><Link to="/" className="text-muted-foreground hover:text-primary">الرئيسية</Link></div>
              <div><Link to="/cart" className="text-muted-foreground hover:text-primary">سلة المشتريات</Link></div>
              <div><Link to="/auth" className="text-muted-foreground hover:text-primary">تسجيل الدخول</Link></div>
            </div>
          </div>
        </div>
        <div className="border-t border-border mt-8 pt-8 text-center">
          <p className="text-muted-foreground">
            © 2025 متجر {settings.site_name || 'بنات'}. جميع الحقوق محفوظة.
          </p>
        </div>
      </div>
    </footer>
  );
}
