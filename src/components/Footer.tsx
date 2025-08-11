import { Phone, Mail, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';

const Footer = () => {
  const settings = {
    whatsapp_number: '+222 49262003',
    email: 'noura.el.houssein@gmail.com',
    location_url: 'https://maps.app.goo.gl/vE3k4Ts1shPzQmNd7',
    site_name_ar: 'بنات',
    site_name_en: 'benat'
  };

  const handleWhatsAppClick = () => {
    window.open(`https://wa.me/${settings.whatsapp_number.replace(/\D/g, '')}`, "_blank");
  };

  const handleEmailClick = () => {
    window.open(`mailto:${settings.email}`, "_blank");
  };

  const handleLocationClick = () => {
    window.open(settings.location_url, "_blank");
  };

  return (
    <footer className="bg-muted py-6 mt-8">
      <div className="container mx-auto px-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-right">
          <div>
            <h3 className="text-base font-semibold text-foreground mb-2">معلومات التواصل</h3>
            <div className="space-y-2">
              <Button
                variant="ghost"
                onClick={handleWhatsAppClick}
                className="text-muted-foreground hover:text-primary flex items-center gap-1 w-full justify-center md:justify-start text-sm"
              >
                <Phone className="h-3 w-3 text-primary" />
                <span>{settings.whatsapp_number}</span>
              </Button>
              
              <Button
                variant="ghost"
                onClick={handleEmailClick}
                className="text-muted-foreground hover:text-primary flex items-center gap-1 w-full justify-center md:justify-start text-sm"
              >
                <Mail className="h-3 w-3 text-primary" />
                <span className="truncate">{settings.email}</span>
              </Button>
              
              <Button
                variant="ghost"
                onClick={handleLocationClick}
                className="text-muted-foreground hover:text-primary flex items-center gap-1 w-full justify-center md:justify-start text-sm"
              >
                <MapPin className="h-3 w-3 text-primary" />
                <span>الموقع الجغرافي</span>
              </Button>
            </div>
          </div>
          
          <div className="flex flex-col items-center justify-center">
            <h2 className="text-xl font-bold text-primary mb-1">{settings.site_name_ar}</h2>
            <p className="text-muted-foreground text-sm">{settings.site_name_en}</p>
          </div>
          
          <div>
            <h3 className="text-base font-semibold text-foreground mb-2">روابط سريعة</h3>
            <div className="space-y-1">
              <div><Link to="/" className="text-muted-foreground hover:text-primary text-sm">الرئيسية</Link></div>
              <div><Link to="/cart" className="text-muted-foreground hover:text-primary text-sm">سلة المشتريات</Link></div>
              <div><Link to="/auth" className="text-muted-foreground hover:text-primary text-sm">تسجيل الدخول</Link></div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-border mt-4 pt-4 text-center">
          <p className="text-muted-foreground text-xs">
            © 2025 متجر {settings.site_name_ar}/{settings.site_name_en}. جميع الحقوق محفوظة.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
