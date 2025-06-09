import React, { useState } from 'react';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import WalletCard from '../components/WalletCard';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import TransactionModal from '../components/TransactionModal';
import apiService from '../services/api';

// Dashboard container
const DashboardContainer = styled.div`
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

// Welcome section
const WelcomeSection = styled.div`
  margin-bottom: 3rem;
`;

const WelcomeMessage = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
`;

const WelcomeSubtext = styled.p`
  color: #6b7280;
  font-size: 1rem;
`;

// Stats section
const StatsSection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
`;

const StatCard = styled(Card)`
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: #3b82f6;
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  color: #6b7280;
  font-size: 0.875rem;
  font-weight: 500;
`;

// Wallets section
const WalletsSection = styled.div`
  margin-bottom: 3rem;
`;

const SectionTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 1.5rem;
`;

const WalletsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
`;

// Quick actions section
const QuickActionsSection = styled.div`
  margin-bottom: 3rem;
`;

const ActionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const Dashboard: React.FC = () => {
  const { user, wallets, refreshProfile } = useAuth();
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
  const [transactionType, setTransactionType] = useState<'deposit' | 'withdraw' | 'transfer'>('deposit');

  // Calculate total balance across all wallets
  const totalBalance = wallets.reduce((sum, wallet) => sum + wallet.balance, 0);

  const handleTransaction = (walletId: string, type: 'deposit' | 'withdraw' | 'transfer') => {
    setSelectedWallet(walletId);
    setTransactionType(type);
    setShowTransactionModal(true);
  };
  const closeModal = () => {
    setShowTransactionModal(false);
    setSelectedWallet(null);
  };

  const handleCreateFirstWallet = async () => {
    try {
      await apiService.createWallet('USD');
      await refreshProfile(); // Refresh to show the new wallet
    } catch (error) {
      console.error('Failed to create wallet:', error);
    }
  };

  return (
    <DashboardContainer>
      <WelcomeSection>
        <WelcomeMessage>Welcome back, {user?.username}!</WelcomeMessage>
        <WelcomeSubtext>Manage your digital wallets and transactions</WelcomeSubtext>
      </WelcomeSection>

      <StatsSection>
        <StatCard elevation="medium">
          <StatValue>${totalBalance.toFixed(2)}</StatValue>
          <StatLabel>Total Balance</StatLabel>
        </StatCard>
        <StatCard elevation="medium">
          <StatValue>{wallets.length}</StatValue>
          <StatLabel>Active Wallets</StatLabel>
        </StatCard>
        <StatCard elevation="medium">
          <StatValue>0</StatValue>
          <StatLabel>Transactions Today</StatLabel>
        </StatCard>
      </StatsSection>

      <WalletsSection>
        <SectionTitle>Your Wallets</SectionTitle>
        {wallets.length > 0 ? (
          <WalletsGrid>
            {wallets.map((wallet) => (
              <WalletCard
                key={wallet.id}
                wallet={wallet}
                onDeposit={(walletId) => handleTransaction(walletId, 'deposit')}
                onWithdraw={(walletId) => handleTransaction(walletId, 'withdraw')}
                onTransfer={(walletId) => handleTransaction(walletId, 'transfer')}
              />
            ))}
          </WalletsGrid>
        ) : (
          <Card elevation="low">
            <div style={{ textAlign: 'center', padding: '2rem' }}>              <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
                You don't have any wallets yet.
              </p>
              <Button variant="primary" onClick={handleCreateFirstWallet}>Create Your First Wallet</Button>
            </div>
          </Card>
        )}
      </WalletsSection>

      <QuickActionsSection>
      </QuickActionsSection>      {showTransactionModal && selectedWallet && (
        <TransactionModal
          walletId={selectedWallet}
          type={transactionType}
          onClose={closeModal}
          onSuccess={async () => {
            // Refresh wallet data after successful transaction
            await refreshProfile();
          }}
        />
      )}
    </DashboardContainer>
  );
};

export default Dashboard;
