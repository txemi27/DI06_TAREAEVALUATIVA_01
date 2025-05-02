import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { BarChartComponent } from './bar-chart.component';
import { GestionApiService } from '../../services/gestion-api.service';
import { ChartResizeService } from '../../services/chart-resize.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BehaviorSubject } from 'rxjs';

describe('BarChartComponent', () => {
  let component: BarChartComponent;
  let fixture: ComponentFixture<BarChartComponent>;
  let gestionServiceApi: GestionApiService;
  let chartResizeService: ChartResizeService;
  let mockDatosSubject: BehaviorSubject<{ categoria: string; totalResults: number } | undefined>;

  beforeEach(waitForAsync(() => {
    mockDatosSubject = new BehaviorSubject<{ categoria: string; totalResults: number } | undefined>(undefined);

    TestBed.configureTestingModule({
      declarations: [BarChartComponent],
      imports: [
        IonicModule.forRoot(),
        HttpClientTestingModule
      ],
      providers: [
        GestionApiService,
        ChartResizeService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BarChartComponent);
    component = fixture.componentInstance;
    gestionServiceApi = TestBed.inject(GestionApiService);
    chartResizeService = TestBed.inject(ChartResizeService);

    // Configurar inputs del componente
    component.datosCategorias = [10, 20, 30];
    component.nombresCategorias = ['Categoria1', 'Categoria2', 'Categoria3'];
    component.backgroundColorCategorias = ['red', 'blue', 'green'];
    component.borderColorCategorias = ['darkred', 'darkblue', 'darkgreen'];
    component.tipoChartSelected = 'bar-chart';

    // Hacer el método actualizarChart público para las pruebas
    (component as any).actualizarChart = component['actualizarChart'];

    fixture.detectChanges();
  }));

  it('Deberia ser creado', () => {
    expect(component).toBeTruthy();
  });

  it('Deberia incializar el chart con los datos correctos', () => {
    // Verificar que el chart se ha inicializado
    expect(component.chart).toBeDefined();
    expect(component.chart.data.labels).toEqual(component.nombresCategorias);
    expect(component.chart.data.datasets.length).toBe(component.nombresCategorias.length);
  });

  it('deberia actualizar el char con los datos correctos', () => {
    const mockData = { categoria: 'Categoria1', totalResults: 50 };
    
    // Simular la recepción de nuevos datos
    component.apiData = [mockData];
    (component as any).actualizarChart();

    // Verificar que el chart se ha actualizado
    expect(component.chart.data.labels).toContain(mockData.categoria);
    expect(component.chart.data.datasets[0].data).toContain(mockData.totalResults);
  });

  it('Deberia redimensionar', () => {
    const resizeSpy = spyOn(chartResizeService, 'resizeChart');
    
    // Simular evento de redimensionamiento
    (chartResizeService as any).resizeSubject.next(true);

    expect(resizeSpy).toHaveBeenCalled();
  });

  it('Deberia limpiar', () => {
    const destroySpy = spyOn(component.chart, 'destroy');
    
    component.ngOnDestroy();

    expect(destroySpy).toHaveBeenCalled();
  });

  it('Deberia actualizar multiples datos', () => {
    const mockData1 = { categoria: 'Categoria1', totalResults: 50 };
    const mockData2 = { categoria: 'Categoria2', totalResults: 75 };
    
    // Simular múltiples actualizaciones de datos
    component.apiData = [mockData1, mockData2];
    (component as any).actualizarChart();

    // Verificar que el chart contiene todos los datos
    expect(component.chart.data.labels).toContain(mockData1.categoria);
    expect(component.chart.data.labels).toContain(mockData2.categoria);
    expect(component.chart.data.datasets[0].data).toContain(mockData1.totalResults);
    expect(component.chart.data.datasets[1].data).toContain(mockData2.totalResults);
  });
});
