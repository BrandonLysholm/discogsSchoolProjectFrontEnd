// Need to create accountinfo

import { IsOptional, IsPhoneNumber, Length } from 'class-validator';

export default class AccountInfo {
  @IsOptional()
  @Length(2, 20, { message: 'Username must be between $constraint1-$constraint2 characters' })
  username:string|undefined;

  @Length(2, 12, { message: 'First name must be between $constraint1-$constraint2 characters' })
  firstName='';

  @Length(2, 12, { message: 'Last name must be between $constraint1-$constraint2 characters' })
  lastName='';

  @IsPhoneNumber('CA', { message: 'Phone number must be a Canadian phone number, Example: (000)-000-0000' })
  phone='';

  address='';

  city='';
}
