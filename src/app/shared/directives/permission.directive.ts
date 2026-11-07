import { Directive, Input, OnInit, TemplateRef, ViewContainerRef, inject } from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';
import { Role } from '../../core/models/user.model';

@Directive({
  selector: '[hasRole]',
  standalone: true,
})
export class HasRoleDirective implements OnInit {
  private auth = inject(AuthService);
  private vcr = inject(ViewContainerRef);
  private tmpl = inject(TemplateRef<unknown>);

  private roles: Role[] = [];

  @Input() set hasRole(roles: Role[]) {
    this.roles = roles;
    this.updateView();
  }

  ngOnInit(): void {
    this.updateView();
  }

  private updateView(): void {
    this.vcr.clear();
    if (this.auth.hasRole(...this.roles)) {
      this.vcr.createEmbeddedView(this.tmpl);
    }
  }
}
