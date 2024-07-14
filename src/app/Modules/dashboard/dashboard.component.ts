import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { DashpordAPIService } from '../../Shared/Services/dashpord-api.service';
import { Costomers } from '../../Shared/Interfaces/costomers';
import { Transactions } from '../../Shared/Interfaces/transactions';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { PeriodicElement } from '../../Shared/Interfaces/periodic-element';
import { CommonModule } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DropdownModule } from 'primeng/dropdown';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [ChartModule, MatFormFieldModule, MatInputModule, MatTableModule, CommonModule, MatTooltipModule, DropdownModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, AfterViewInit {
  constructor(private _DashpordAPIService: DashpordAPIService, private cdr: ChangeDetectorRef) {}
  //#region  Variables
  CostomerData: Costomers[] = [];
  TransactionsData: Transactions[] = [];
  GraphCircleData: any;
  GraphCircleOptions: any;
  BasicChartOptions: any;
  BasicChartData: any;
  GraphCircleDataLable: string[] = [];
  GraphCircleDataData: number[] = [];
  CombinedData: any[] = [];
  ELEMENT_DATA: PeriodicElement[] = [];
  LinedGraphData: any;
  LineGraphOption: any;
  SelectedCustomerTransactions: any[] = [];
  SelectedCustomerGraphData: any;
  SelectedCustomer: any;
  CustomerDropdownOptions: any[] = [];
  //#endregion

  //#region feach transaction data
  ngOnInit(): void {
    this._DashpordAPIService.GetTransactionsData().subscribe({
      next: (response) => {
        this.CostomerData = response.record.customers;
        this.TransactionsData = response.record.transactions;
        this.combineData();
        this.GetCircleGraphData();
        this.prepareCustomerDropdown();
        this.cdr.detectChanges();
      },
    });
  }
  //#endregion

  //#region  handle table data
  combineData() {
    this.CombinedData = this.TransactionsData.map(transaction => {
      const customer = this.CostomerData.find(c => c.id === transaction.customer_id);
      return {
        Transition_id: transaction.id,
        Id: customer?.id,
        name: customer?.name,
        Transaction_Date: transaction.date,
        Amount: transaction.amount
      };
    });

    for (let i = 0; i < this.CombinedData.length; i++) {
      this.ELEMENT_DATA.push(this.CombinedData[i]);
    }
    // console.log(this.ELEMENT_DATA);
  }
  //#endregion

  //#region get cercle data
  GetCircleGraphData() {
    for (let i = 0; i < this.ELEMENT_DATA.length; i++) {
      const currentName = this.ELEMENT_DATA[i].name.toLocaleLowerCase();
      const customerAmounts = this.ELEMENT_DATA.filter(item =>
        item.name.toLocaleLowerCase().includes(currentName)
      );

      let amount = 0;
      for (let j = 0; j < customerAmounts.length; j++) {
        amount += customerAmounts[j].Amount;
      }

      this.GraphCircleDataData.push(amount);
    }
  }
  //#endregion

  //#region prepare customer dropdown
  prepareCustomerDropdown() {
    this.CustomerDropdownOptions = this.CostomerData.map(customer => ({
      label: customer.name,
      value: customer.id
    }));
  }
  //#endregion

  //#region select customer and plot graph
  selectCustomer(event: any) {
    const customerId = event.value;
    this.SelectedCustomerTransactions = this.TransactionsData.filter(transaction => transaction.customer_id === customerId);

    // Group by date and sum amounts
    const dateAmountMap = this.SelectedCustomerTransactions.reduce((acc, transaction) => {
      if (!acc[transaction.date]) {
        acc[transaction.date] = 0;
      }
      acc[transaction.date] += transaction.amount;
      return acc;
    }, {});

    const dates = Object.keys(dateAmountMap);
    const amounts = dates.map(date => dateAmountMap[date]);

    //#region selected costomer Graph data
    this.SelectedCustomerGraphData = {
      labels: [0,...dates],
      datasets: [
        {
          label: 'Total Amount per Day',
          data: [0,...amounts],
          fill: true,
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1
        }
      ]
    };
    //#endregion

    this.cdr.detectChanges();
  }
  //#endregion

  ngAfterViewInit(): void {
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      const documentStyle = getComputedStyle(document.documentElement);
      const textColor = documentStyle.getPropertyValue('--text-color');

      // numberof transactions
      for (let i = 0; i < this.CostomerData.length; i++) {
        this.GraphCircleDataLable.push(this.CostomerData[i].name);
      }

      //#region Circle Graph
      this.GraphCircleData = {
        labels: this.GraphCircleDataLable,
        datasets: [
          {
            data: this.GraphCircleDataData.filter((value, index, self) => self.indexOf(value) === index),
            backgroundColor: [
              documentStyle.getPropertyValue('--blue-500'),
              documentStyle.getPropertyValue('--yellow-500'),
              documentStyle.getPropertyValue('--green-500'),
              documentStyle.getPropertyValue('--red-500'),
              documentStyle.getPropertyValue('--purple-500'),
            ],
            hoverBackgroundColor: [
              documentStyle.getPropertyValue('--blue-400'),
              documentStyle.getPropertyValue('--yellow-400'),
              documentStyle.getPropertyValue('--green-400'),
              documentStyle.getPropertyValue('--red-400'),
              documentStyle.getPropertyValue('--purple-400'),
            ],
          },
        ],
      };
      this.GraphCircleOptions = {
        cutout: '70%',
        plugins: {
          legend: {
            labels: {
              color: textColor,
            },
          },
        },
      };
      //#endregion

      //#region lines Graph
      const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
      const surfaceBorder = documentStyle.getPropertyValue('--surface-border');
      this.LinedGraphData = {
        labels: [0, ...this.GraphCircleDataLable],
        datasets: [
          {
            label: 'Amount',
            fill: true,
            borderColor: documentStyle.getPropertyValue('--green-500'),
            yAxisID: 'y1',
            tension: 0.4,
            data: [0, ...this.GraphCircleDataData.filter((value, index, self) => self.indexOf(value) === index)]
          }
        ]
      };

      this.LineGraphOption = {
        stacked: false,
        maintainAspectRatio: false,
        aspectRatio: 0.6,
        plugins: {
          legend: {
            labels: {
              color: textColor
            }
          }
        },
        scales: {
          x: {
            ticks: {
              color: textColorSecondary
            },
            grid: {
              color: surfaceBorder
            }
          },
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            ticks: {
              color: textColorSecondary
            },
            grid: {
              color: surfaceBorder
            }
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            ticks: {
              color: textColorSecondary
            },
            grid: {
              drawOnChartArea: false,
              color: surfaceBorder
            }
          }
        }
      };
      //#endregion
    }
    this.cdr.detectChanges();
  }

  //#region mat table display

  displayedColumns = ['Index', 'position', 'name', 'weight', 'symbol'];
  dataSource = new MatTableDataSource(this.ELEMENT_DATA);
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
  //#endregion
}
