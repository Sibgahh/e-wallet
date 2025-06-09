import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';
import { Transaction } from '@e-wallet/shared';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';

// Page container
const TransactionsContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

// Page title
const PageTitle = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 2rem;
`;

// Filters section
const FiltersSection = styled.div`
  margin-bottom: 2rem;
`;

const FiltersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
`;

const FilterSelect = styled.select`
  padding: 0.5rem 0.75rem;
  font-size: 1rem;
  border-radius: 0.375rem;
  border: 1px solid #d1d5db;
  background-color: white;
  color: #1f2937;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
  }
`;

// Transactions list
const TransactionsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const TransactionItem = styled(Card)`
  display: flex;
  justify-content: between;
  align-items: center;
  padding: 1rem;
`;

const TransactionInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
`;

const TransactionIcon = styled.div<{ type: string }>`
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  background-color: ${props => {
    switch (props.type.toLowerCase()) {
      case 'deposit':
        return '#dcfce7';
      case 'withdrawal':
        return '#fee2e2';
      case 'transfer':
        return '#dbeafe';
      default:
        return '#f3f4f6';
    }
  }};
  color: ${props => {
    switch (props.type.toLowerCase()) {
      case 'deposit':
        return '#16a34a';
      case 'withdrawal':
        return '#dc2626';
      case 'transfer':
        return '#2563eb';
      default:
        return '#6b7280';
    }
  }};
`;

const TransactionDetails = styled.div`
  flex: 1;
`;

const TransactionType = styled.div`
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.25rem;
`;

const TransactionDescription = styled.div`
  color: #6b7280;
  font-size: 0.875rem;
`;

const TransactionAmount = styled.div<{ type: string }>`
  font-size: 1.25rem;
  font-weight: 700;
  color: ${props => {
    switch (props.type.toLowerCase()) {
      case 'deposit':
        return '#16a34a';
      case 'withdrawal':
        return '#dc2626';
      case 'transfer':
        return '#2563eb';
      default:
        return '#6b7280';
    }
  }};
`;

const TransactionDate = styled.div`
  color: #6b7280;
  font-size: 0.875rem;
  text-align: right;
`;

// Empty state
const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 1rem;
  color: #6b7280;
`;

const EmptyStateIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 1rem;
`;

const EmptyStateTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #374151;
`;

const EmptyStateDescription = styled.p`
  margin-bottom: 2rem;
`;

const TransactionsPage: React.FC = () => {
  const { wallets } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load transactions on component mount and when wallet selection changes
  useEffect(() => {
    loadTransactions();
  }, [selectedWallet, wallets]);

  const loadTransactions = async () => {
    if (wallets.length === 0) {
      setTransactions([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (selectedWallet === 'all') {
        // Load transactions for all wallets
        const allTransactions: Transaction[] = [];
        for (const wallet of wallets) {
          const response = await apiService.getWalletTransactions(wallet.id);
          if (response.success && response.data) {
            allTransactions.push(...response.data);
          }
        }
        // Sort by date (newest first)
        allTransactions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setTransactions(allTransactions);
      } else {
        // Load transactions for specific wallet
        const response = await apiService.getWalletTransactions(selectedWallet);
        if (response.success && response.data) {
          setTransactions(response.data);
        } else {
          setError('Failed to load transactions');
        }
      }
    } catch (error: any) {
      console.error('Error loading transactions:', error);
      setError('Failed to load transactions');
    } finally {
      setIsLoading(false);
    }
  };
  const getTransactionIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'deposit':
        return '📥';
      case 'withdrawal':
        return '📤';
      case 'transfer':
        return '🔄';
      default:
        return '💳';
    }
  };
  const formatAmount = (amount: number, type: string) => {
    const prefix = type.toLowerCase() === 'withdrawal' ? '-' : '+';
    return `${prefix}$${amount.toFixed(2)}`;
  };
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };  const formatTransactionType = (type: string) => {
    return type.toLowerCase().charAt(0).toUpperCase() + type.toLowerCase().slice(1);
  };

  // Filter transactions based on selected filters
  const filteredTransactions = transactions.filter(transaction => {
    // Filter by type
    if (selectedType !== 'all' && transaction.type.toLowerCase() !== selectedType.toLowerCase()) {
      return false;
    }

    // Filter by date
    if (dateFilter !== 'all') {
      const transactionDate = new Date(transaction.createdAt);
      const now = new Date();
      
      switch (dateFilter) {
        case 'today':
          if (transactionDate.toDateString() !== now.toDateString()) {
            return false;
          }
          break;
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          if (transactionDate < weekAgo) {
            return false;
          }
          break;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          if (transactionDate < monthAgo) {
            return false;
          }
          break;
      }
    }

    return true;
  });

  return (
    <TransactionsContainer>
      <PageTitle>Transaction History</PageTitle>

      <FiltersSection>
        <Card elevation="low">
          <h3 style={{ marginBottom: '1rem', color: '#374151' }}>Filters</h3>
          <FiltersGrid>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: '#4b5563' }}>
                Wallet
              </label>
              <FilterSelect
                value={selectedWallet}
                onChange={(e) => setSelectedWallet(e.target.value)}
              >
                <option value="all">All Wallets</option>
                {wallets.map((wallet) => (
                  <option key={wallet.id} value={wallet.id}>
                    {wallet.currency} Wallet
                  </option>
                ))}
              </FilterSelect>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: '#4b5563' }}>
                Type
              </label>
              <FilterSelect
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="deposit">Deposits</option>
                <option value="withdrawal">Withdrawals</option>
                <option value="transfer">Transfers</option>
              </FilterSelect>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: '#4b5563' }}>
                Date Range
              </label>
              <FilterSelect
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </FilterSelect>
            </div>
          </FiltersGrid>
          
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <Button variant="outline" onClick={() => {
              setSelectedWallet('all');
              setSelectedType('all');
              setDateFilter('all');
            }}>
              Clear Filters
            </Button>
            <Button variant="primary">
              Export CSV
            </Button>
          </div>
        </Card>
      </FiltersSection>      <TransactionsList>
        {isLoading ? (
          <Card elevation="low">
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <p style={{ color: '#6b7280' }}>Loading transactions...</p>
            </div>
          </Card>
        ) : error ? (
          <Card elevation="low">
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <p style={{ color: '#dc2626', marginBottom: '1rem' }}>{error}</p>
              <Button variant="primary" onClick={loadTransactions}>
                Try Again
              </Button>
            </div>
          </Card>
        ) : filteredTransactions.length > 0 ? (
          filteredTransactions.map((transaction) => (
            <TransactionItem key={transaction.id} elevation="low">
              <TransactionInfo>
                <TransactionIcon type={transaction.type}>
                  {getTransactionIcon(transaction.type)}
                </TransactionIcon>
                <TransactionDetails>
                  <TransactionType>
                    {formatTransactionType(transaction.type)}
                  </TransactionType>
                  <TransactionDescription>
                    {transaction.description || 'No description'}
                  </TransactionDescription>
                </TransactionDetails>
              </TransactionInfo>
              <div style={{ textAlign: 'right' }}>
                <TransactionAmount type={transaction.type}>
                  {formatAmount(transaction.amount, transaction.type)}
                </TransactionAmount>
                <TransactionDate>
                  {formatDate(transaction.createdAt.toString())}
                </TransactionDate>
              </div>
            </TransactionItem>
          ))
        ) : (
          <Card elevation="low">
            <EmptyState>
              <EmptyStateIcon>📊</EmptyStateIcon>
              <EmptyStateTitle>No transactions found</EmptyStateTitle>
              <EmptyStateDescription>
                {transactions.length === 0 
                  ? "You haven't made any transactions yet. Start by making a deposit or transfer."
                  : "No transactions match the selected filters. Try adjusting your filter criteria."
                }
              </EmptyStateDescription>
              <Button variant="primary">
                Make Your First Transaction
              </Button>
            </EmptyState>
          </Card>
        )}
      </TransactionsList>
    </TransactionsContainer>
  );
};

export default TransactionsPage;
