import React from 'react';
import styled from 'styled-components';
import { Wallet } from '@e-wallet/shared';
import Card from './Card';
import Button from './Button';

// Define wallet card props
interface WalletCardProps {
  wallet: Wallet;
  onDeposit?: (walletId: string) => void;
  onWithdraw?: (walletId: string) => void;
  onTransfer?: (walletId: string) => void;
  onViewTransactions?: (walletId: string) => void;
}

// Styled wallet header
const WalletHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

// Styled wallet title
const WalletTitle = styled.h3`
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
`;

// Styled wallet currency
const WalletCurrency = styled.span`
  font-size: 0.875rem;
  color: #6b7280;
  background-color: #f3f4f6;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
`;

// Styled wallet number
const WalletNumber = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
  font-family: monospace;
  background-color: #f9fafb;
  padding: 0.5rem;
  border-radius: 0.25rem;
  border: 1px solid #e5e7eb;
`;

const WalletNumberLabel = styled.span`
  font-size: 0.75rem;
  color: #9ca3af;
  display: block;
  margin-bottom: 0.25rem;
`;

// Styled wallet balance
const WalletBalance = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin: 1rem 0;
`;

// Styled wallet actions container
const WalletActions = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
  
  @media (max-width: 640px) {
    flex-direction: column;
  }
`;

// Wallet card component
const WalletCard: React.FC<WalletCardProps> = ({
  wallet,
  onDeposit,
  onWithdraw,
  onTransfer,
  onViewTransactions,
}) => {
  // Format wallet balance with 2 decimal places
  const formattedBalance = wallet.balance.toFixed(2);
  
  // Handle action button clicks
  const handleDeposit = () => onDeposit && onDeposit(wallet.id);
  const handleWithdraw = () => onWithdraw && onWithdraw(wallet.id);
  const handleTransfer = () => onTransfer && onTransfer(wallet.id);
  const handleViewTransactions = () => onViewTransactions && onViewTransactions(wallet.id);
  
  return (
    <Card border elevation="medium">      <WalletHeader>
        <WalletTitle>Wallet</WalletTitle>
        <WalletCurrency>{wallet.currency}</WalletCurrency>
      </WalletHeader>
      
      <WalletNumber>
        <WalletNumberLabel>Wallet Number</WalletNumberLabel>
        {wallet.walletNumber}
      </WalletNumber>
      
      <WalletBalance>
        {wallet.currency} {formattedBalance}
      </WalletBalance>
      
      <WalletActions>
        <Button variant="primary" onClick={handleDeposit}>Deposit</Button>
        <Button variant="outline" onClick={handleWithdraw}>Withdraw</Button>
        <Button variant="secondary" onClick={handleTransfer}>Transfer</Button>
        <Button variant="outline" onClick={handleViewTransactions}>Transactions</Button>
      </WalletActions>
    </Card>
  );
};

export default WalletCard; 