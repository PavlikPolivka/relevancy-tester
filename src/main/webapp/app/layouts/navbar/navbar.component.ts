import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import {JhiLanguageService, AlertService, EventManager} from 'ng-jhipster';

import {ProfileService} from '../profiles/profile.service';
import {JhiLanguageHelper, Principal, LoginModalService, LoginService} from '../../shared';

import {VERSION, DEBUG_INFO_ENABLED} from '../../app.constants';
import {ProjectService} from '../../entities/project/project.service';
import {Response} from '@angular/http';
import {Project} from '../../entities/project/project.model';
import {Subscription} from 'rxjs';

@Component({
    selector: 'jhi-navbar',
    templateUrl: './navbar.component.html',
    styleUrls: [
        'navbar.scss'
    ]
})
export class NavbarComponent implements OnInit {

    inProduction: boolean;
    isNavbarCollapsed: boolean;
    languages: any[];
    swaggerEnabled: boolean;
    modalRef: NgbModalRef;
    version: string;
    projects: Project[];

    private eventSubscriber: Subscription;
    private authEventSubscriber: Subscription;

    constructor(private loginService: LoginService,
                private languageHelper: JhiLanguageHelper,
                private languageService: JhiLanguageService,
                private principal: Principal,
                private loginModalService: LoginModalService,
                private profileService: ProfileService,
                private router: Router,
                private projectService: ProjectService,
                private alertService: AlertService,
                private eventManager: EventManager) {
        this.version = DEBUG_INFO_ENABLED ? 'v' + VERSION : '';
        this.isNavbarCollapsed = true;
        this.languageService.addLocation('home');
    }

    ngOnInit() {
        this.loadProjects();
        this.languageHelper.getAll().then((languages) => {
            this.languages = languages;
        });

        this.profileService.getProfileInfo().subscribe((profileInfo) => {
            this.inProduction = profileInfo.inProduction;
            this.swaggerEnabled = profileInfo.swaggerEnabled;
        });
        this.registerChangeInProjects();
        this.registerChangeInAuth();
    }

    registerChangeInProjects() {
        this.eventSubscriber = this.eventManager.subscribe('projectListModification', (response) => this.loadProjects());
    }

    registerChangeInAuth() {
        this.authEventSubscriber = this.eventManager.subscribe('authenticationSuccess', (response) => this.loadProjects());
    }

    loadProjects() {
        this.projectService.query().subscribe(
            (res: Response) => {
                this.projects = res.json();
            },
            (res: Response) => this.onError(res.json())
        );
    }

    changeLanguage(languageKey: string) {
        this.languageService.changeLanguage(languageKey);
    }

    collapseNavbar() {
        this.isNavbarCollapsed = true;
    }

    isAuthenticated() {
        return this.principal.isAuthenticated();
    }

    login() {
        this.modalRef = this.loginModalService.open();
    }

    logout() {
        this.collapseNavbar();
        this.loginService.logout();
        this.router.navigate(['']);
    }

    toggleNavbar() {
        this.isNavbarCollapsed = !this.isNavbarCollapsed;
    }

    getImageUrl() {
        return this.isAuthenticated() ? this.principal.getImageUrl() : null;
    }

    private onError(error) {
        this.alertService.error(error.message, null, null);
    }
}
