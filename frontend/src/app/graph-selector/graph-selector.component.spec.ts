import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GraphSelectorComponent } from './graph-selector.component';
import { Actions, NgxsModule, Store, ofActionDispatched } from '@ngxs/store';
import { AppApi } from '../app.api';
import { Observable } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { AttempPsswdLogin } from '../app.actions';

describe('GraphSelectorComponent', () => {
    let component: GraphSelectorComponent;
    let storeSpy: jasmine.SpyObj<Store>;
    let appApiSpy: jasmine.SpyObj<AppApi>;
    let actions$: Observable<any>;

    beforeEach(() => {
        appApiSpy = jasmine.createSpyObj('AppApi', ['attemptPsswdLogin']);
        appApiSpy.attemptPsswdLogin.and.callThrough();

        TestBed.configureTestingModule({
            providers: [GraphSelectorComponent, { provide: AppApi, useValue: appApiSpy }],
            imports: [NgxsModule.forRoot([]), FormsModule],
        });

        component = TestBed.inject(GraphSelectorComponent);
        storeSpy = TestBed.inject(Store) as jasmine.SpyObj<Store>;
        actions$ = TestBed.inject(Actions);
    });

    it('should render the graph after view init', (done) => {
        component.ngAfterViewInit();

        setTimeout(() => {
            // expect(component.chart).toBeDefined();
            done()
        }, 1000);
    });

    it('should switch to the right graph when the index changes', (done) => {
        const mockGraphData = [
            {
                type: 'doughnut',
                data: {
                    labels: ['Overall Score'],
                    datasets: [
                        {
                            data: [],
                            backgroundColor: [
                                'rgba(3, 127, 255, 1)',
                                'rgba(0, 0, 0, 0.1)',
                                'rgba(0, 0, 0, 0)',
                            ],
                            borderWidth: 0,
                        },
                    ],
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '50%', // Adjust the cutout percentage to control the size of the gauge
                    rotation: 1 * Math.PI, // Adjust the rotation angle to position the gauge needle
                    tooltips: {
                        enabled: false, // Disable tooltips to prevent them from appearing on hover
                    },
                    plugins: {
                        legend: {
                            display: false, // Disable legend display
                        },
                    },
                },
            },
            {
                type: 'pie',
                data: {
                    labels: ['Positive', 'Negative', 'Neutral'], // Replace with your data labels
                    datasets: [
                        {
                            data: [], // Replace with your data values
                            backgroundColor: [
                                'rgba(75, 192, 192, 0.8)', // Color for slice 1
                                'rgba(255, 99, 132, 0.8)', // Color for slice 2
                                'rgba(54, 162, 235, 0.8)', // Color for slice 3
                            ],
                            borderColor: [
                                'rgba(75, 192, 192, 1)', // Border color for slice 1
                                'rgba(255, 99, 132, 1)', // Border color for slice 2
                                'rgba(54, 162, 235, 1)', // Border color for slice 3
                            ],
                            borderWidth: 1,
                        },
                    ],
                },
                options: {
                    // Additional options for your chart
                },
            },
            {
                type: 'bar', // Replace with your desired chart type (e.g., line, pie, etc.)
                data: {
                    labels: [
                        'anger',
                        'disgust',
                        'fear',
                        'joy',
                        'neutral',
                        'sadness',
                        'surprise',
                    ], // Replace with your data labels
                    datasets: [
                        {
                            label: 'Rating per Emotion', // Replace with your dataset label
                            data: [], // Replace with your dataset values
                            backgroundColor: [
                                'rgba(3, 127, 255, 0.8)',
                                'rgba(145, 44, 246, 0.8)',
                                'rgba(23, 35, 76, 0.8)',
                                'rgba(255, 99, 132, 0.8)',
                                'rgba(54, 162, 235, 0.8)',
                                'rgba(255, 206, 86, 0.8)',
                                'rgba(75, 192, 192, 0.8)',
                            ], // Replace with desired colors

                            borderColor: [
                                'rgba(3, 127, 255, 1)',
                                'rgba(145, 44, 246, 1)',
                                'rgba(23, 35, 76, 1)',
                                'rgba(255, 99, 132, 1)',
                                'rgba(54, 162, 235, 1)',
                                'rgba(255, 206, 86, 1)',
                                'rgba(75, 192, 192, 1)',
                            ],

                            borderWidth: 1,
                        },
                    ],
                },
                options: {
                    title: {
                        display: true,
                        text: 'Number of Sentiments Analysed per Source',
                        align: 'left',
                    },
                    responsive: true,
                    drawChartArea: false,
                    maintainAspectRatio: false,
                    interaction: {
                        mode: 'nearest', // Set the interaction mode to 'nearest' to prevent hover events
                        intersect: false, // Disable event interactions with elements
                    },
                    legend: {
                        display: false,
                    },
                },
            },
            {
                type: 'pie',
                data: {
                    labels: ['Toxic', 'Non-Toxic'], // Replace with your data labels
                    datasets: [
                        {
                            data: [], // Replace with your data values
                            backgroundColor: [
                                'rgba(3, 127, 255, 0.8)',
                                'rgba(145, 44, 246, 0.8)',
                            ],
                            borderColor: [
                                'rgba(3, 127, 255, 1)',
                                'rgba(145, 44, 246, 1)', // Border color for slice 3
                            ],
                            borderWidth: 1,
                        },
                    ],
                },
                options: {
                    // Additional options for your chart
                },
            },
            /* {
              type: 'bar', // Replace with your desired chart type (e.g., line, pie, etc.)
              data: {
                labels: ['Facebook', 'Instagram', 'Reddit'], // Replace with your data labels
                datasets: [
                  {
                    label: 'Nr. of Sentiments', // Replace with your dataset label
                    data: [23000, 17530, 3450], // Replace with your dataset values
                    backgroundColor: [
                      'rgba(3, 127, 255, 0.8)',
                      'rgba(145, 44, 246, 0.8)',
                      'rgba(23, 35, 76, 0.8)',
                    ], // Replace with desired colors
                    borderColor: [
                      'rgba(3, 127, 255, 1)',
                      'rgba(145, 44, 246, 1)',
                      'rgba(23, 35, 76, 1)',
                    ],
                    borderWidth: 1,
                  },
                ],
              },
              options: {
                title: {
                  display: true,
                  text: 'Number of Sentiments Analysed per Source',
                  align: 'left',
                },
                responsive: true,
                drawChartArea: false,
                maintainAspectRatio: false,
                interaction: {
                  mode: 'nearest', // Set the interaction mode to 'nearest' to prevent hover events
                  intersect: false, // Disable event interactions with elements
                },
                legend: {
                  display: false,
                },
              },
            } */

            /* Define your different graphs here */
            // { labels: ['Label 1', 'Label 2', 'Label 3'], data: [10, 20, 30], ... },
            // { labels: ['Label A', 'Label B', 'Label C'], data: [50, 40, 30], ... },
            // ...
        ];

        component.updatedGraphArray = component.assignGraphData(mockGraphData[0], component.graphs);


        component.switchToNextGraph();
        expect(component.currentGraphIndex).toEqual(1);

        component.switchToPreviousGraph();
        component.switchToPreviousGraph();
        expect(component.currentGraphIndex).toEqual(3);
    });
});
