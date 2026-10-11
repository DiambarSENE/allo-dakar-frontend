import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

interface InfoSection { id?: string; title: string; paragraphs: string[]; bullets?: string[]; }
interface InfoPageContent { eyebrow: string; title: string; intro: string; sections: InfoSection[]; actionLabel?: string; actionLink?: string; }

const CONTENT: Record<string, InfoPageContent> = {
  driver: {
    eyebrow: 'Guide conducteur', title: 'Proposez vos places, partagez la route.',
    intro: 'Vous prenez la route entre Dakar, Thiès, Mbour, Saint-Louis, Touba, Kaolack ou une autre ville du Sénégal ? Publiez votre trajet et permettez à d’autres voyageurs de vous accompagner en partageant les frais convenus.',
    sections: [
      { title: 'Comment devenir conducteur ?', paragraphs: ['Créez votre compte Allo Dakar et complétez les informations de votre profil. Avant de publier, assurez-vous que votre véhicule est en bon état et que vos documents sont valides.'], bullets: ['Complétez votre profil avec des informations exactes.', 'Soumettez les documents demandés pour la vérification du conducteur.', 'Publiez le départ, la destination, la date, l’heure, les places disponibles et la contribution demandée.', 'Consultez les demandes de réservation et confirmez les modalités du rendez-vous avec les passagers.'] },
      { id: 'advice-driver', title: 'Conseils aux conducteurs', paragraphs: ['Une bonne organisation rend le trajet plus agréable pour tout le monde.'], bullets: ['Respectez les horaires et prévenez rapidement en cas de retard ou de changement.', 'Convenez à l’avance d’un point de rencontre clair et facile à identifier.', 'Ne surchargez jamais le véhicule et respectez le code de la route sénégalais.', 'Présentez clairement la contribution aux frais et ce qu’elle couvre.', 'Protégez les données personnelles des passagers et restez courtois.', 'En cas de problème, utilisez le signalement depuis votre espace Allo Dakar.'] },
    ], actionLabel: 'Publier un trajet', actionLink: '/driver/trips/new',
  },
  passenger: {
    eyebrow: 'Guide passager', title: 'Trouvez une place et voyagez ensemble.',
    intro: 'Allo Dakar vous aide à trouver un trajet partagé pour vos déplacements au Sénégal : visite familiale, études, travail, rendez-vous ou voyage entre régions.',
    sections: [
      { title: 'Comment devenir passager ?', paragraphs: ['Recherchez un départ, comparez les informations proposées et choisissez le trajet qui correspond à votre besoin.'], bullets: ['Créez un compte et renseignez un profil exact pour faciliter les échanges.', 'Recherchez par ville de départ, destination et date.', 'Lisez attentivement les détails du trajet, les avis disponibles et les conditions annoncées.', 'Réservez votre place depuis Allo Dakar et consultez le statut de votre réservation.', 'Confirmez avec le conducteur le point de rendez-vous et l’heure de départ.'] },
      { id: 'advice-passenger', title: 'Conseils aux passagers', paragraphs: ['Quelques précautions simples contribuent à un déplacement plus serein.'], bullets: ['Arrivez à l’heure au point de rencontre convenu.', 'Confirmez les détails du trajet avant le départ et gardez les coordonnées utiles à portée de main.', 'Ne partagez pas de mot de passe ni de code de validation.', 'Vérifiez le véhicule et le conducteur au rendez-vous avant de monter.', 'Attachez votre ceinture et respectez les consignes de sécurité.', 'Si une situation vous semble suspecte, interrompez l’échange si nécessaire et signalez le problème à Allo Dakar.'] },
    ], actionLabel: 'Explorer les trajets', actionLink: '/trips',
  },
  faq: {
    eyebrow: 'Centre d’aide', title: 'Questions fréquentes',
    intro: 'Retrouvez les réponses aux questions courantes sur le covoiturage avec Allo Dakar.',
    sections: [
      { title: 'Comment rechercher un trajet ?', paragraphs: ['Ouvrez la page « Consulter les départs », indiquez votre ville de départ, votre destination et la date souhaitée, puis consultez les résultats disponibles.'] },
      { title: 'Comment publier un départ ?', paragraphs: ['Connectez-vous avec un compte conducteur, complétez les informations demandées et publiez votre trajet avec le nombre de places disponibles et les conditions de partage des frais.'] },
      { title: 'Comment fonctionne la réservation ?', paragraphs: ['Choisissez un trajet et suivez le parcours de réservation affiché sur la plateforme. Consultez le statut de la réservation dans votre espace personnel et ne considérez pas une demande en attente comme confirmée.'] },
      { title: 'Comment sont vérifiés les conducteurs ?', paragraphs: ['Les conducteurs peuvent soumettre les documents demandés dans leur espace de vérification. La présence d’un profil ou d’un document soumis ne remplace jamais votre propre vigilance.'] },
      { title: 'Que faire si un trajet est annulé ou si un problème survient ?', paragraphs: ['Consultez le statut de votre réservation et contactez le conducteur via les moyens convenus. Vous pouvez aussi envoyer un signalement depuis votre compte afin que l’équipe puisse examiner la situation.'] },
      { title: 'Allo Dakar garantit-il les horaires et la sécurité ?', paragraphs: ['Allo Dakar facilite la mise en relation, mais les conditions de circulation, les retards et les imprévus restent possibles. Respectez le code de la route, confirmez les détails avant le départ et signalez tout comportement préoccupant.'] },
    ], actionLabel: 'Contacter notre équipe', actionLink: '/contact',
  },
  contact: {
    eyebrow: 'Nous contacter', title: 'Comment pouvons-nous vous aider ?',
    intro: 'Une question sur un trajet, une réservation, un profil ou un problème rencontré ? Consultez d’abord la FAQ, puis envoyez un signalement si votre demande concerne un incident lié à un trajet ou à un utilisateur.',
    sections: [
      { title: 'Pour un problème lié à un trajet', paragraphs: ['Connectez-vous et utilisez le formulaire de signalement. Si possible, indiquez le trajet, la réservation ou le profil concerné et décrivez les faits de façon précise. Ne publiez pas d’informations personnelles sensibles dans un espace public.'] },
      { title: 'Pour une question générale', paragraphs: ['Vous pouvez consulter les questions fréquentes ou utiliser le formulaire de signalement existant pour transmettre une difficulté liée à la plateforme. Évitez d’envoyer des mots de passe, codes de paiement ou informations bancaires.'] },
    ], actionLabel: 'Accéder au formulaire de signalement', actionLink: '/reports/new',
  },
  terms: {
    eyebrow: 'Cadre d’utilisation', title: 'Conditions d’utilisation',
    intro: 'Ces règles résument les bonnes pratiques d’utilisation d’Allo Dakar. Elles sont rédigées pour informer les membres et ne remplacent pas une validation juridique formelle des conditions applicables au service.',
    sections: [
      { title: 'Informations exactes et compte personnel', paragraphs: ['Chaque membre doit fournir des informations exactes, maintenir son profil à jour et protéger ses identifiants. Un compte ne doit pas être utilisé pour usurper l’identité d’une autre personne.'] },
      { title: 'Engagements des conducteurs', paragraphs: ['Le conducteur doit disposer des documents et autorisations nécessaires, maintenir son véhicule en état de circulation, respecter le code de la route et publier des informations sincères sur son trajet.'] },
      { title: 'Engagements des passagers', paragraphs: ['Le passager doit respecter les horaires et les règles convenues, se comporter avec courtoisie et suivre les consignes de sécurité. Toute contribution aux frais doit être comprise et convenue avant le départ.'] },
      { title: 'Réservations, paiements et annulations', paragraphs: ['Les membres doivent vérifier le statut de leur réservation et les conditions affichées avant de considérer une place comme confirmée. Les paiements éventuels doivent passer par les parcours officiellement proposés par la plateforme. N’envoyez jamais de codes confidentiels à un autre membre.'] },
      { title: 'Sécurité, signalements et modération', paragraphs: ['Les comportements dangereux, profils suspects, fraudes, contenus offensants ou incidents peuvent être signalés. Allo Dakar peut examiner les informations transmises et prendre des mesures selon les règles du service.'] },
      { title: 'Respect de la vie privée', paragraphs: ['N’utilisez les coordonnées et informations des autres membres que pour organiser le trajet concerné. Ne diffusez pas leurs données sans autorisation et limitez les informations personnelles partagées.'] },
      { title: 'Évolution des règles', paragraphs: ['Les fonctionnalités et règles du service peuvent évoluer. Cette page devra être mise à jour et validée juridiquement avant d’être considérée comme un document contractuel définitif.'] },
    ], actionLabel: 'Nous contacter', actionLink: '/contact',
  },
  mobile: {
    eyebrow: 'Allo Dakar sur mobile', title: 'Vos trajets, partout avec vous.',
    intro: 'Vous pouvez dès maintenant utiliser le site Allo Dakar depuis le navigateur de votre téléphone pour rechercher des trajets, consulter vos réservations et gérer votre compte.',
    sections: [
      { title: 'Application iPhone et Android', paragraphs: ['Les liens officiels de téléchargement iOS et Android seront activés lorsque les applications Allo Dakar seront publiées sur l’App Store et Google Play. Pour le moment, aucun lien de téléchargement officiel n’est disponible : utilisez la version mobile du site et méfiez-vous des applications non officielles.'] },
    ], actionLabel: 'Explorer les trajets', actionLink: '/trips',
  },
};

@Component({
  selector: 'app-info-page',
  imports: [CommonModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="info-page">
      <section class="info-hero"><div class="info-container"><a class="info-back" routerLink="/">← Accueil</a><span class="info-eyebrow">{{ content.eyebrow }}</span><h1>{{ content.title }}</h1><p class="info-intro">{{ content.intro }}</p><a *ngIf="content.actionLabel && content.actionLink" class="info-action" [routerLink]="content.actionLink">{{ content.actionLabel }} <span aria-hidden="true">→</span></a></div></section>
      <section class="info-content info-container"><article class="info-section" *ngFor="let section of content.sections" [attr.id]="section.id || null"><h2>{{ section.title }}</h2><p *ngFor="let paragraph of section.paragraphs">{{ paragraph }}</p><ul *ngIf="section.bullets?.length"><li *ngFor="let bullet of section.bullets">{{ bullet }}</li></ul></article><div class="info-help"><strong>Encore une question ?</strong><span>Notre centre d’aide vous accompagne dans votre utilisation d’Allo Dakar.</span><a routerLink="/faq">Consulter la FAQ</a></div></section>
    </main>
  `,
  styles: [`
    :host{display:block;color:#19352f}.info-page{min-height:60vh;background:#fff}.info-container{width:min(1080px,calc(100% - 40px));margin:0 auto}.info-hero{padding:42px 0 54px;background:linear-gradient(125deg,#eaf5ef 0%,#f7f8f1 65%,#fff0e6 100%)}.info-back{display:inline-block;margin-bottom:26px;color:#176b5c;font-size:.9rem;font-weight:700;text-decoration:none}.info-eyebrow{display:block;color:#c75b27;font-size:.78rem;font-weight:800;letter-spacing:.12em;text-transform:uppercase}.info-hero h1{max-width:800px;margin:12px 0 16px;font-size:clamp(2rem,5vw,3.35rem);line-height:1.08;letter-spacing:-.04em}.info-intro{max-width:780px;margin:0;color:#536760;font-size:1.08rem;line-height:1.8}.info-action{display:inline-flex;gap:14px;align-items:center;margin-top:24px;padding:13px 19px;border-radius:12px;background:#176b5c;color:#fff;font-weight:800;text-decoration:none}.info-content{padding-top:36px;padding-bottom:64px}.info-section{max-width:850px;padding:20px 0 24px;border-bottom:1px solid #e5ece8;scroll-margin-top:30px}.info-section h2{margin:0 0 12px;font-size:1.35rem;letter-spacing:-.02em}.info-section p,.info-section li{color:#586b64;line-height:1.8}.info-section p{margin:8px 0}.info-section ul{padding-left:22px}.info-section li{padding:4px 0}.info-help{display:flex;flex-wrap:wrap;gap:8px 18px;align-items:center;margin-top:30px;padding:20px;border-radius:16px;background:#f1f7f3}.info-help strong{width:100%;font-size:1.05rem}.info-help span{flex:1;color:#536760;line-height:1.6}.info-help a{color:#176b5c;font-weight:800;text-decoration:none}@media(max-width:600px){.info-container{width:min(100% - 30px,1080px)}.info-hero{padding:30px 0 38px}.info-intro{font-size:1rem}.info-help{align-items:flex-start;flex-direction:column}}
  `],
})
export class InfoPage {
  private readonly route = inject(ActivatedRoute);
  protected readonly content: InfoPageContent = CONTENT[this.route.snapshot.data['pageKey']] ?? CONTENT['faq'];
}
