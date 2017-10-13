import { Component, ViewContainerRef, Compiler, NgModule, OnInit } from '@angular/core';
import { JitCompilerFactory } from '@angular/compiler';

export function CustomComponent(annotation: any) {
  return function (target: Function) {
    const metaData = new Component(annotation);
    Component(metaData)(target);
  };
}

export function CustomNgModule(annotation: any) {
  return function (target: Function) {
    const metaData = new NgModule(annotation);
    NgModule(metaData)(target);
  };
}

export function compilerFactory() {
  return new JitCompilerFactory([{ useDebug: false, useJit: true }]).createCompiler();
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [{ provide: Compiler, useFactory: compilerFactory }]
})
export class AppComponent implements OnInit {

  public template = '<div>Hello JIT</div>';

  constructor(
    private view: ViewContainerRef,
    private compiler: Compiler
  ) { }

  private createCompoent(template: string) {
    const metadata = {
      selector: 'dynamic-component',
      template: template
    };

    @Component(metadata)
    @CustomComponent(metadata)
    class DynamicComponent { }

    return DynamicComponent;
  }

  private createModule(modules: any[], componentType: any) {
    const metadata = {
      imports: [...modules],
      declarations: [componentType]
    };

    @NgModule(metadata)
    @CustomNgModule(metadata)
    class DynamicModule { }

    return DynamicModule;
  }

  public async ngOnInit() {
    const compoent = this.createCompoent(this.template);
    const module = this.createModule([], compoent);
    const moduleWithComponentFactories = await this.compiler.compileModuleAndAllComponentsAsync(module);
    const compoentFactory = moduleWithComponentFactories.componentFactories[0];
    this.view.clear();
    const compRef = this.view.createComponent(compoentFactory);
  }

}
