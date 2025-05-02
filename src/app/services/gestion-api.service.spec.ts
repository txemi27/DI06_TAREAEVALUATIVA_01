import { TestBed } from '@angular/core/testing';
import { GestionApiService } from './gestion-api.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Noticias } from '../interfaces/interface';

describe('GestionApiService', () => {
  let service: GestionApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [GestionApiService]
    });
    service = TestBed.inject(GestionApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // Verificar que no hay peticiones HTTP pendientes
    httpMock.verify();
  });

  it('Deberia ser creado', () => {
    expect(service).toBeTruthy();
  });

  it('Debería cargar una categoría y emitir los datos correctamente', () => {
    const categoria = 'business';
    const mockResponse: Noticias = {
      status: 'ok',
      totalResults: 10,
      articles: []
    };

    // Suscribirse a datos$ antes de llamar a cargarCategoria
    let receivedData: { categoria: string; totalResults: number } | undefined;
    service.datos$.subscribe(data => {
      receivedData = data;
    });

    // Llamar al método que queremos probar
    service.cargarCategoria(categoria);

    // Verificar que se hizo la petición HTTP correcta
    const req = httpMock.expectOne(
      `${service.apiUrl}/top-headlines?country=us&category=${categoria}&apiKey=${service.apiKey}`
    );
    expect(req.request.method).toBe('GET');

    // Responder con los datos mock
    req.flush(mockResponse);

    // Verificar que los datos emitidos son correctos
    expect(receivedData).toEqual({
      categoria: categoria,
      totalResults: mockResponse.totalResults
    });
  });

  it('Debería manejar errores correctamente', () => {
    const categoria = 'business';
    const errorMessage = 'Error en la petición';

    // Suscribirse a datos$
    let receivedData: { categoria: string; totalResults: number } | undefined;
    service.datos$.subscribe(data => {
      receivedData = data;
    });

    service.cargarCategoria(categoria);

    const req = httpMock.expectOne(
      `${service.apiUrl}/top-headlines?country=us&category=${categoria}&apiKey=${service.apiKey}`
    );

    // Simular un error
    req.error(new ErrorEvent('Network error', {
      message: errorMessage
    }));

    // Verificar que se emitió undefined en caso de error
    expect(receivedData).toBeUndefined();
  });

  it('Debería manejar respuestas con totalResults igual a 0', () => {
    const categoria = 'business';
    const mockResponse: Noticias = {
      status: 'ok',
      totalResults: 0,
      articles: []
    };

    // Suscribirse a datos$
    let receivedData: { categoria: string; totalResults: number } | undefined;
    service.datos$.subscribe(data => {
      receivedData = data;
    });

    service.cargarCategoria(categoria);

    const req = httpMock.expectOne(
      `${service.apiUrl}/top-headlines?country=us&category=${categoria}&apiKey=${service.apiKey}`
    );

    // Responder con datos con totalResults = 0
    req.flush(mockResponse);

    // Verificar que no se emitió ningún dato
    expect(receivedData).toBeUndefined();
  });

  it('Debería cargar los datos en el BehaviorSubject correctamente', () => {
    const categoria = 'business';
    const mockResponse: Noticias = {
      status: 'ok',
      totalResults: 2,
      articles: [
        {
          source: {
            id: '111',
            name: 'Ejemplo1'
          },
          author: 'Autor1',
          title: 'Titulo1',
          description: 'Descripcion1',
          url: 'https://www.ejemplo.com',
          urlToImage: 'https://wwww.ejemplo.com/image.jpg',
          publishedAt: '2024-03-11T04:45:29Z',
          content: 'Contenido1'
        },
        {
          source: {
            id: '222',
            name: 'Ejemplo2'
          },
          author: 'Autor2',
          title: 'Titulo2',
          description: 'Descripcion2',
          url: 'https://www.ejemplo.com',
          urlToImage: 'https://wwww.ejemplo.com/image.jpg',
          publishedAt: '2024-03-11T04:45:29Z',
          content: 'Contenido2'
        }
      ]
    };

    // Ejecutamos la lógica de cargarCategoria
    service.cargarCategoria(categoria);

    // Simulamos la llamada API
    const req = httpMock.expectOne(
      `${service.apiUrl}/top-headlines?country=us&category=${categoria}&apiKey=${service.apiKey}`
    );
    expect(req.request.method).toBe('GET');

    // Simulamos la respuesta del servidor
    req.flush(mockResponse);

    // Verificamos que el BehaviorSubject se actualizó correctamente
    service.datos$.subscribe(data => {
      expect(data).toBeDefined();
      expect(data?.categoria).toBe(categoria);
      expect(data?.totalResults).toBe(mockResponse.totalResults);
    });
  });
});