import React, { useState } from 'react';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';
import Button from './Button';
import Input from './Input';
import Card from './Card';

// Modal backdrop
const ModalBackdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
`;

// Modal container
const ModalContainer = styled(Card)`
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
`;

// Modal header
const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e5e7eb;
`;

const ModalTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6b7280;
  padding: 0.25rem;
  border-radius: 0.25rem;
  
  &:hover {
    background-color: #f3f4f6;
    color: #374151;
  }
`;

// Form section
const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 500;
  color: #4b5563;
  margin-bottom: 0.25rem;
`;

const HelpText = styled.p`
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.25rem;
  margin-bottom: 0;
`;

// Action buttons
const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
`;

interface TransactionModalProps {
  walletId: string;
  type: 'deposit' | 'withdraw' | 'transfer';
  onClose: () => void;
  onSuccess?: () => void; // Callback to refresh data after successful transaction
}

const TransactionModal: React.FC<TransactionModalProps> = ({
  walletId,
  type,
  onClose,
  onSuccess
}) => {
  const { wallets } = useAuth();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');  const [recipientWalletNumber, setRecipientWalletNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getModalTitle = () => {
    switch (type) {
      case 'deposit':
        return 'Deposit Money';
      case 'withdraw':
        return 'Withdraw Money';
      case 'transfer':
        return 'Transfer Money';
      default:
        return 'Transaction';
    }
  };

  const getSubmitButtonText = () => {
    switch (type) {
      case 'deposit':
        return 'Deposit';
      case 'withdraw':
        return 'Withdraw';
      case 'transfer':
        return 'Transfer';
      default:
        return 'Submit';
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }    if (type === 'transfer' && !recipientWalletNumber) {
      setError('Please enter a recipient wallet number');
      return;
    }

    setIsLoading(true);

    try {
      const amountNum = parseFloat(amount);
      
      switch (type) {
        case 'deposit':
          await apiService.deposit(walletId, amountNum);
          break;
          
        case 'withdraw':
          await apiService.withdraw(walletId, amountNum);
          break;
            case 'transfer':
          await apiService.transferByWalletNumber(walletId, recipientWalletNumber, amountNum);
          break;
          
        default:
          throw new Error('Invalid transaction type');
      }

      // Call success callback to refresh parent data
      if (onSuccess) {
        onSuccess();
      }
      
      onClose();
    } catch (error: any) {
      console.error('Transaction failed:', error);
      setError(error.response?.data?.error || error.message || 'Transaction failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <ModalBackdrop onClick={handleBackdropClick}>
      <ModalContainer elevation="high">
        <ModalHeader>
          <ModalTitle>{getModalTitle()}</ModalTitle>
          <CloseButton onClick={onClose}>×</CloseButton>        </ModalHeader>

        {error && (
          <div style={{ 
            background: '#fee2e2', 
            color: '#dc2626', 
            padding: '0.75rem', 
            borderRadius: '0.375rem', 
            marginBottom: '1rem',
            fontSize: '0.875rem'
          }}>
            {error}
          </div>
        )}

        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="amount">Amount ($)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0"
              step="0.01"
              required
              fullWidth
            />
          </FormGroup>          {type === 'transfer' && (
            <FormGroup>
              <Label htmlFor="recipientWalletNumber">Recipient Wallet Number</Label>
              <Input
                id="recipientWalletNumber"
                type="text"
                placeholder="Enter wallet number (e.g., EW12345678)"
                value={recipientWalletNumber}
                onChange={(e) => setRecipientWalletNumber(e.target.value)}
                required
                fullWidth
              />
              <HelpText>
                Enter the recipient's wallet number. You can find your wallet number in your wallet details.
              </HelpText>
            </FormGroup>
          )}

          <FormGroup>
            <Label htmlFor="description">Description (Optional)</Label>
            <Input
              id="description"
              type="text"
              placeholder={`Enter ${type} description...`}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
            />
          </FormGroup>

          <ActionButtons>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              fullWidth
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              fullWidth
            >
              {getSubmitButtonText()}
            </Button>
          </ActionButtons>
        </Form>
      </ModalContainer>
    </ModalBackdrop>
  );
};

export default TransactionModal;
