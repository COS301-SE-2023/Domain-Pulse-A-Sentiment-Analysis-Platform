import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AppApi } from './app.api';



describe('AppApi', () => {
  let appApi: AppApi;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AppApi],
    });

    appApi = TestBed.inject(AppApi);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should get domain IDs for a user', (done: DoneFn) => {
    const userId = 1;
    const expectedResponse = { status: 'SUCCESS', domainIDs: ['id1', 'id2'] };

    appApi.getDomainIDs(userId).subscribe((response) => {
      expect(response).toEqual(expectedResponse);
      done();
    });

    const req = httpTestingController.expectOne('/api/profiles/profiles/get_domains_for_user');
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({ id: userId });

    req.flush(expectedResponse);
  });

  it('should make a POST request to get domain info', () => {
    const domainID = 'testDomainID';
  
    
    const expectedResponse = {
      status: 'SUCCESS',
      domain: {
        _id: '1',
        name: 'Test Domain',
        description: 'Test Domain Description',
        icon: 'test_icon.png',
        sources: [],
      },
    };
  
    
    appApi.getDomainInfo(domainID).subscribe((response) => {
      expect(response).toEqual(expectedResponse);
    });
  
    
    const expectedUrl = '/api/domains/domains/get_domain';
    const expectedMethod = 'POST';
  
    
    const req = httpTestingController.expectOne(expectedUrl);
  
    
    expect(req.request.method).toEqual(expectedMethod);
  
    
    req.flush(expectedResponse);
  });

  it('should make a POST request to get aggregated domain data', () => {
    const sourceIds: string[] = ['source_id_1', 'source_id_2'];
  
    
    const expectedResponse = {
      status: 'SUCCESS',
      data: { /* Aggregated data here */ },
    };
  
    
    appApi.getAggregatedDomainData(sourceIds).subscribe((response) => {
      expect(response).toEqual(expectedResponse);
    });
  
    
    const expectedUrl = '/api/warehouse/query/get_domain_dashboard/';
    const expectedMethod = 'POST';
  
    
    const req = httpTestingController.expectOne(expectedUrl);
  
    
    expect(req.request.method).toEqual(expectedMethod);
  
    
    req.flush(expectedResponse);
  });
  

  it('should make a POST request to add a new domain', () => {
    const domainName = 'Test Domain';
    const domainDescription = 'Test Domain Description';
    const domainImageUrl = 'test_icon.png';
  
    
    const expectedResponse = {
      status: 'SUCCESS',
      domain: {
        _id: '1',
        name: domainName,
        description: domainDescription,
        icon: domainImageUrl,
        sources: [],
      },
    };
  
    
    appApi.addDomain(domainName, domainDescription, domainImageUrl).subscribe((response) => {
      expect(response).toEqual(expectedResponse);
    });
  
    
    const expectedUrl = '/api/domains/domains/create_domain';
    const expectedMethod = 'POST';
  
    
    const req = httpTestingController.expectOne(expectedUrl);
  
    
    expect(req.request.method).toEqual(expectedMethod);
  
    
    req.flush(expectedResponse);
  });

  it('should make a POST request to edit a domain', () => {
    const domainID = 'testDomainID';
    const domainName = 'Updated Domain';
    const domainImageUrl = 'new_icon.png';
    const domainDescription = 'Updated Domain Description';
    const expectedResponse = {
      status: 'SUCCESS',
      domain: {
        _id: domainID,
        name: domainName,
        icon: domainImageUrl,
        description: domainDescription,
      },
    };

    appApi.editDomain(domainID, domainName, domainImageUrl, domainDescription).subscribe((response) => {
      expect(response).toEqual(expectedResponse);
    });

    const expectedUrl = '/api/domains/domains/edit_domain';
    const expectedMethod = 'POST';
    const expectedBody = {
      id: domainID,
      name: domainName,
      icon: domainImageUrl,
      description: domainDescription,
    };

    const req = httpTestingController.expectOne(expectedUrl);
    expect(req.request.method).toEqual(expectedMethod);
    expect(req.request.body).toEqual(expectedBody);

    req.flush(expectedResponse);
  });
  
  it('should make a POST request to remove a domain', () => {
    const domainID = 'testDomainID';
    const expectedResponse = {
      status: 'SUCCESS',
      confirmation: 'Domain removed successfully',
    };

    appApi.removeDomain(domainID).subscribe((response) => {
      expect(response).toEqual(expectedResponse);
    });

    const expectedUrl = '/api/domains/domains/delete_domain';
    const expectedMethod = 'POST';
    const expectedBody = {
      id: domainID,
    };

    const req = httpTestingController.expectOne(expectedUrl);
    expect(req.request.method).toEqual(expectedMethod);
    expect(req.request.body).toEqual(expectedBody);

    req.flush(expectedResponse);
  });

  it('should make a POST request to link a domain to a profile', () => {
    const domainID = 123; 
    const profileID = 456; 
    const expectedResponse = {
      status: 'SUCCESS',
      message: 'Domain linked to profile successfully',
    };

    appApi.linkDomainToProfile(domainID, profileID).subscribe((response) => {
      expect(response).toEqual(expectedResponse);
    });

    const expectedUrl = '/api/profiles/profiles/add_domain_to_profile';
    const expectedMethod = 'POST';
    const expectedBody = {
      domain_id: domainID,
      id: profileID,
    };

    const req = httpTestingController.expectOne(expectedUrl);
    expect(req.request.method).toEqual(expectedMethod);
    expect(req.request.body).toEqual(expectedBody);

    req.flush(expectedResponse);
  });

  it('should make a POST request to add a new source to a domain', () => {
    const domainID = 'domain123'; 
    const sourceName = 'New Source'; 
    const sourceImageUrl = 'https://www.example.com/image.png';
    const params = { key: 'value' }; 
    const expectedResponse = {
      status: 'SUCCESS',
      message: 'Source added successfully',
    };

    appApi.addSource(domainID, sourceName, sourceImageUrl, params).subscribe((response) => {
      expect(response).toEqual(expectedResponse);
    });

    const expectedUrl = '/api/domains/domains/add_source';
    const expectedMethod = 'POST';
    const expectedBody = {
      id: domainID,
      source_name: sourceName,
      source_icon: sourceImageUrl,
      params: params,
    };

    const req = httpTestingController.expectOne(expectedUrl);
    expect(req.request.method).toEqual(expectedMethod);
    expect(req.request.body).toEqual(expectedBody);

    req.flush(expectedResponse);
  });

  it('should make a POST request to edit a source', () => {
    const sourceId = 'source123'; 
    const sourceName = 'Edited Source'; 
    const expectedResponse = {
      status: 'SUCCESS',
      message: 'Source edited successfully',
    };

    appApi.editSource(sourceId, sourceName).subscribe((response) => {
      expect(response).toEqual(expectedResponse);
    });

    const expectedUrl = '/api/domains/domains/edit_source';
    const expectedMethod = 'POST';
    const expectedBody = {
      source_id: sourceId,
      name: sourceName,
    };

    const req = httpTestingController.expectOne(expectedUrl);
    expect(req.request.method).toEqual(expectedMethod);
    expect(req.request.body).toEqual(expectedBody);

    req.flush(expectedResponse);
  });

  it('should make a POST request to delete a source', () => {
    const domainId = 'domain123'; 
    const sourceId = 'source123'; 
    const expectedResponse = {
      status: 'SUCCESS',
      message: 'Source deleted successfully',
    };
  
    appApi.deleteSource(domainId, sourceId).subscribe((response) => {
      expect(response).toEqual(expectedResponse);
    });
  
    const expectedUrl = '/api/domains/domains/remove_source';
    const expectedMethod = 'POST';
    const expectedBody = {
      id: domainId,
      source_id: sourceId,
    };
  
    const req = httpTestingController.expectOne(expectedUrl);
    expect(req.request.method).toEqual(expectedMethod);
    expect(req.request.body).toEqual(expectedBody);
  
    req.flush(expectedResponse);
  });

  it('should make a POST request to refresh source information', () => {
    const sourceId = 'source123'; 
    const expectedResponse = {
      status: 'SUCCESS',
      message: 'Source information refreshed successfully',
      data: {
        
      },
    };
  
    appApi.refreshSourceInfo(sourceId).subscribe((response) => {
      expect(response).toEqual(expectedResponse);
    });
  
    const expectedUrl = '/api/warehouse/query/refresh_source/';
    const expectedMethod = 'POST';
    const expectedBody = {
      source_id: sourceId,
    };
  
    const req = httpTestingController.expectOne(expectedUrl);
    expect(req.request.method).toEqual(expectedMethod);
    expect(req.request.body).toEqual(expectedBody);
  
    req.flush(expectedResponse);
  });

  it('should make a POST request to get source information', () => {
    const sourceId = 123; 
    const expectedResponse = {
      status: 'SUCCESS',
      data: {
        id: sourceId,
        name: 'Test Source',
        imageUrl: 'https://www.example.com/image.png',
        
      },
    };
  
    appApi.getSourceInfo(sourceId).subscribe((response) => {
      expect(response).toEqual(expectedResponse);
    });
  
    const expectedUrl = '/api/domains/domains/get_source';
    const expectedMethod = 'POST';
    const expectedBody = {
      id: sourceId,
    };
  
    const req = httpTestingController.expectOne(expectedUrl);
    expect(req.request.method).toEqual(expectedMethod);
    expect(req.request.body).toEqual(expectedBody);
  
    req.flush(expectedResponse);
  });

  it('should make a POST request to get source sentiment data', () => {
    const sourceId = 'abc123'; 
    const expectedResponse = {
      status: 'SUCCESS',
      data: {
        
      },
    };
  
    appApi.getSourceSentimentData(sourceId).subscribe((response) => {
      expect(response).toEqual(expectedResponse);
    });
  
    const expectedUrl = '/api/warehouse/query/get_source_dashboard/';
    const expectedMethod = 'POST';
    const expectedBody = {
      source_id: sourceId,
    };
  
    const req = httpTestingController.expectOne(expectedUrl);
    expect(req.request.method).toEqual(expectedMethod);
    expect(req.request.body).toEqual(expectedBody);
  
    req.flush(expectedResponse);
  });

  it('should make a POST request to check authentication', () => {
    const expectedResponse = {
      status: 'SUCCESS',
      authenticated: true,
      
    };
  
    appApi.checkAuthenticate().subscribe((response) => {
      expect(response).toEqual(expectedResponse);
    });
  
    const expectedUrl = '/api/profiles/check/check_logged_in/';
    const expectedMethod = 'POST';
  
    const req = httpTestingController.expectOne(expectedUrl);
    expect(req.request.method).toEqual(expectedMethod);
    expect(req.request.body).toEqual({});
  
    req.flush(expectedResponse);
  });

  it('should make a POST request to log out', () => {
    const expectedResponse = {
      status: 'SUCCESS',
      message: 'Logged out successfully',
      
    };
  
    appApi.logOut().subscribe((response) => {
      expect(response).toEqual(expectedResponse);
    });
  
    const expectedUrl = '/api/profiles/profiles/logout_user';
    const expectedMethod = 'POST';
  
    const req = httpTestingController.expectOne(expectedUrl);
    expect(req.request.method).toEqual(expectedMethod);
    expect(req.request.body).toEqual({});
  
    req.flush(expectedResponse);
  });

  it('should make a POST request to register a new user', () => {
    const username = 'testuser';
    const email = 'testuser@example.com';
    const password = 'testpassword';
  
    const expectedResponse = {
      status: 'SUCCESS',
      message: 'User registered successfully',
      
    };
  
    appApi.registerUser(username, email, password).subscribe((response) => {
      expect(response).toEqual(expectedResponse);
    });
  
    const expectedUrl = '/api/profiles/profiles/create_user';
    const expectedMethod = 'POST';
  
    const req = httpTestingController.expectOne(expectedUrl);
    expect(req.request.method).toEqual(expectedMethod);
    expect(req.request.body).toEqual({ username, email, password });
  
    req.flush(expectedResponse);
  });

  it('should make a POST request to change user password', () => {
    const userId = 123; 
    const oldPassword = 'oldpass';
    const newPassword = 'newpass';
  
    const expectedResponse = {
      status: 'SUCCESS',
      message: 'Password changed successfully',
      
    };
  
    appApi.changePassword(userId, oldPassword, newPassword).subscribe((response) => {
      expect(response).toEqual(expectedResponse);
    });
  
    const expectedUrl = '/api/profiles/profiles/change_password';
    const expectedMethod = 'POST';
  
    const req = httpTestingController.expectOne(expectedUrl);
    expect(req.request.method).toEqual(expectedMethod);
    expect(req.request.body).toEqual({ id: userId, oldpassword: oldPassword, newpassword: newPassword });
  
    req.flush(expectedResponse);
  });

  it('should make a POST request to delete user', () => {
    const username = 'testuser';
    const password = 'testpass';
  
    const expectedResponse = {
      status: 'SUCCESS',
      message: 'User deleted successfully',
      
    };
  
    appApi.deleteUser(username, password).subscribe((response) => {
      expect(response).toEqual(expectedResponse);
    });
  
    const expectedUrl = '/api/profiles/profiles/delete_user';
    const expectedMethod = 'POST';
  
    const req = httpTestingController.expectOne(expectedUrl);
    expect(req.request.method).toEqual(expectedMethod);
    expect(req.request.body).toEqual({ username: username, password: password });
  
    req.flush(expectedResponse);
  });

  it('should make a POST request to change profile icon', () => {
    const profileID = 123;
    const profilePicture = 'https://www.example.com/image.png';
  
    const expectedResponse = {
      status: 'SUCCESS',
      message: 'Profile icon changed successfully',
      
    };
  
    appApi.changeProfileIcon(profileID, profilePicture).subscribe((response) => {
      expect(response).toEqual(expectedResponse);
    });
  
    const expectedUrl = '/api/profiles/profiles/edit_profile_picture';
    const expectedMethod = 'POST';
  
    const req = httpTestingController.expectOne(expectedUrl);
    expect(req.request.method).toEqual(expectedMethod);
    expect(req.request.body).toEqual({ id: profileID, pictureURL: profilePicture });
  
    req.flush(expectedResponse);
  });

  it('should make a POST request for password login', () => {
    const username = 'testuser';
    const password = 'testpassword';
  
    const expectedResponse = {
      status: 'SUCCESS',
      message: 'Login successful',
      
    };
  
    appApi.attemptPsswdLogin(username, password).subscribe((response) => {
      expect(response).toEqual(expectedResponse);
    });
  
    const expectedUrl = '/api/profiles/profiles/login_user';
    const expectedMethod = 'POST';
  
    const req = httpTestingController.expectOne(expectedUrl);
    expect(req.request.method).toEqual(expectedMethod);
    expect(req.request.body).toEqual({ username, password });
  
    req.flush(expectedResponse);
  });

  it('should make a POST request to get a user by ID', () => {
    const userID = 456;
  
    const expectedResponse = {
      id: userID,
      username: 'testuser2',
      email: 'testuser2@example.com',
      
    };
  
    appApi.getUserByID(userID).subscribe((response) => {
      expect(response).toEqual(expectedResponse);
    });
  
    const expectedUrl = '/api/profiles/profiles/get_user_by_id';
    const expectedMethod = 'POST';
  
    const req = httpTestingController.expectOne(expectedUrl);
    expect(req.request.method).toEqual(expectedMethod);
    expect(req.request.body).toEqual({ id: userID });
  
    req.flush(expectedResponse);
  });

  it('should make a POST request to change mode for a profile', () => {
    const profileID = 123;
  
    const expectedResponse = {
      id: profileID,
      mode: 'dark',
      
    };
  
    appApi.changeMode(profileID).subscribe((response) => {
      expect(response).toEqual(expectedResponse);
    });
  
    const expectedUrl = '/api/profiles/profiles/swap_mode';
    const expectedMethod = 'POST';
  
    const req = httpTestingController.expectOne(expectedUrl);
    expect(req.request.method).toEqual(expectedMethod);
    expect(req.request.body).toEqual({ id: profileID });
  
    req.flush(expectedResponse);
  });

  it('should send a POST request to toggle isActive', () => {
    const sourceID = '123';
    const isActive = true;

    const expectedResponse = {};

    appApi.setIsActive(sourceID, isActive).subscribe((response) => {
      expect(response).toEqual(expectedResponse);
    });

    const expectedUrl = '/api/domains/domains/toggle_is_active';
    const expectedMethod = 'POST';
    const expectedBody = {
      source_id: sourceID,
      is_active: isActive,
    };

    const req = httpTestingController.expectOne(expectedUrl);
    expect(req.request.method).toEqual(expectedMethod);
    expect(req.request.body).toEqual(expectedBody);

    req.flush(expectedResponse);
  });


  it('should send a POST request to get a profile by ID', () => {
    const profileID = 456;

    const expectedResponse = {};

    appApi.getProfile(profileID).subscribe((response) => {
      expect(response).toEqual(expectedResponse);
    });

    const expectedUrl = '/api/profiles/profiles/get_profile';
    const expectedMethod = 'POST';
    const expectedBody = {
      id: profileID,
    };

    const req = httpTestingController.expectOne(expectedUrl);
    expect(req.request.method).toEqual(expectedMethod);
    expect(req.request.body).toEqual(expectedBody);

    req.flush(expectedResponse);
  });

  it('should send a POST request to generate a report for a domain', () => {
    const domainId = '650579d05ce2576d38fcd99a';

    const expectedResponse = {
      status: "SUCCESS",
      url: jasmine.stringMatching(
        /^https:\/\/domainpulseblob\.blob\.core\.windows\.net\/pdf\/MeetingReport[0-9a-zA-Z]+\.pdf/
      ),
  };

    appApi.generateReport(domainId).subscribe((response) => {
      expect(response).toEqual(expectedResponse);
    });

    const expectedUrl = '/api/profiles/report/generate_report';
    const expectedMethod = 'POST';
    const expectedBody = {
      domain_id: domainId,
    };

    const req = httpTestingController.expectOne(expectedUrl);
    expect(req.request.method).toEqual(expectedMethod);
    expect(req.request.body).toEqual(expectedBody);

    req.flush(expectedResponse);
  });

  

    it('should send a POST request to upload a CSV file', () => {
      const sourceID = '123';
      const file = new File(['sample CSV content'], 'sample.csv', { type: 'text/csv' });
  
      const expectedResponse = {};
  
      appApi.sendCSVFile(sourceID, file).subscribe((response) => {
        expect(response).toEqual(expectedResponse);
        console.log("flag response csv");
        console.log(response);
      });
  
      const expectedUrl = '/api/warehouse/ingest/ingest_csv/';
      const expectedMethod = 'POST';
  
      const req = httpTestingController.expectOne(expectedUrl);
      expect(req.request.method).toEqual(expectedMethod);
  
      // Check the request body (form data)
      const formData = new FormData();
      formData.append('file', file);
      formData.append('source_id', sourceID);
      expect(req.request.body).toEqual(formData);
  
      req.flush(expectedResponse);
    });
  
  // put this in the api file btw
  // it('should send a file with sourceID when sendFile is called', () => {
  //   const sourceID = '65034fff5aff62e633eb690b';
  //   const mockFile = new File(['mock content'], 'mock.csv', {
  //     type: 'text/csv',
  //   });

  //   spyOn(storeSpy, 'selectSnapshot').and.returnValue({ id: sourceID });

  //   component.newCSVFile = mockFile;

  //   component.sendFile(sourceID);

  //   const testUrl = '/api/warehouse/ingest/ingest_csv/';
  //   const testData = {};

  //   httpClient.get<Data>(testUrl).subscribe((data) => {
  //     console.log('test data: ' + data);
  //     expect(data).toEqual(testData);

  //     httpTestingController.verify();
  //   });
  // });
  
});
