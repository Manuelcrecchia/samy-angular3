import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Router } from '@angular/router';

type SnowFlake = { x:number; y:number; r:number; vy:number; vx:number; a:number };

@Component({
  selector: 'app-homesito',
  templateUrl: './homesito.component.html',
  styleUrls: ['./homesito.component.css']
})
export class HomesitoComponent implements OnInit, OnDestroy {

  services = [
    { title: 'Sanificazioni', img: 'assets/sanificazione.jpg', link: '/sanificazioni' },
    { title: 'Pulizia Palestre', img: 'assets/pulizia palestre.jpg', link: '/palestra' },
    { title: 'Pulizia Condomini', img: 'assets/pulizia-condominio.jpg', link: '/condomini1' },
    { title: 'Pulizia Uffici', img: 'assets/pulizia ufficio.jpg', link: '/uffici' },
    { title: 'Pulizia Domestica', img: 'assets/pulizia domestica.jpg', link: '/domestica' },
    { title: 'Pulizia Straordinaria', img: 'assets/pulizia straordinaria.jpg', link: '/straordinaria' }
  ];

  private snowRAF?: number;
  private footerRAF?: number;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.initSnow('snowCanvas', true);
    setTimeout(() => this.initSnow('footerSnow', false), 0);
  }

  ngOnDestroy(): void {
    if (this.snowRAF) cancelAnimationFrame(this.snowRAF);
    if (this.footerRAF) cancelAnimationFrame(this.footerRAF);
  }

  // Navigazione
  navigateToService(link: string){ this.router.navigateByUrl(link); }
  navigateToPrivateArea(){ this.router.navigateByUrl('/loginPrivateArea'); }
  navigateToSanificazioni(){ this.router.navigateByUrl('/sanificazioni'); }
  navigateToUffici(){ this.router.navigateByUrl('/uffici'); }
  navigateToCondomini1(){ this.router.navigateByUrl('/condomini1'); }
  navigateToPalestra(){ this.router.navigateByUrl('/palestra'); }
  navigateToStraordinaria(){ this.router.navigateByUrl('/straordinaria'); }
  navigateToDomestica(){ this.router.navigateByUrl('/domestica'); }
  navigateToPrivacy(){ this.router.navigateByUrl('/privacy'); }
  navigateToPreventiviSito(){ this.router.navigateByUrl('/preventivi-sito'); }
  navigateToBlog(){ this.router.navigateByUrl('/blog'); }

  // Effetto riduzione navbar allo scroll
  @HostListener('window:scroll', [])
  onWindowScroll() {
    const nav = document.getElementById('mainNav');
    if (!nav) return;
    if (window.scrollY > 80) {
      nav.classList.remove('nav-large');
      nav.classList.add('nav-small');
    } else {
      nav.classList.add('nav-large');
      nav.classList.remove('nav-small');
    }
  }

  // Neve
  private initSnow(id: string, isGlobal: boolean){
    const canvas = document.getElementById(id) as HTMLCanvasElement | null;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      if (isGlobal) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        canvas.style.position = 'fixed';
      } else {
        const footer = canvas.closest('footer') as HTMLElement | null;
        const rect = footer ? footer.getBoundingClientRect() : { width: window.innerWidth, height: 300 } as DOMRect;
        canvas.width = Math.max(1, rect.width);
        canvas.height = Math.max(1, (rect.height || 300));
        canvas.style.position = 'absolute';
      }
    };
    resize();
    window.addEventListener('resize', resize);

    const flakes: SnowFlake[] = Array.from({ length: isGlobal ? 140 : 80 }).map(() => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * (isGlobal ? 2.2 : 2.8) + 0.8,
      vy: Math.random() * (isGlobal ? 0.9 : 0.7) + 0.25,
      vx: (Math.random() - 0.5) * 0.35,
      a: Math.random() * 0.6 + 0.3
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'white';
      flakes.forEach(f => {
        ctx.globalAlpha = f.a;
        ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2); ctx.fill();
        f.y += f.vy; f.x += f.vx;
        if (f.y > canvas.height + 6) { f.y = -6; f.x = Math.random() * canvas.width; }
        if (f.x > canvas.width + 6) f.x = -6; else if (f.x < -6) f.x = canvas.width + 6;
      });
      const raf = requestAnimationFrame(draw);
      if (isGlobal) this.snowRAF = raf; else this.footerRAF = raf;
    };
    draw();
  }
}
