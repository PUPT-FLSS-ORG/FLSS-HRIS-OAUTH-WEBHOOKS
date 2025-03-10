export interface PersonalDetails {
  PersonalDetailsID?: number;
  UserID: number;
  PlaceOfBirth?: string;
  CivilStatus?: 'Single' | 'Married' | 'Widowed' | 'Separated' | 'Other';
  OtherCivilStatus?: string;
  Height?: number;
  Weight?: number;
  BloodType?: string;
  GSISNumber?: string;
  PagIbigNumber?: string;
  PhilHealthNumber?: string;
  SSSNumber?: string;
  TINNumber?: string;
  AgencyEmployeeNumber?: string;
  CitizenshipType?: 'Filipino' | 'Dual Citizenship';
  CitizenshipAcquisition?: 'by birth' | 'by naturalization';
  CitizenshipCountry?: string;
  ResidentialHouseBlockLot?: string;
  ResidentialStreet?: string;
  ResidentialSubdivisionVillage?: string;
  ResidentialBarangay?: string;
  ResidentialCityMunicipality?: string;
  ResidentialProvince?: string;
  ResidentialZipCode?: string;
  PermanentHouseBlockLot?: string;
  PermanentStreet?: string;
  PermanentSubdivisionVillage?: string;
  PermanentBarangay?: string;
  PermanentCityMunicipality?: string;
  PermanentProvince?: string;
  PermanentZipCode?: string;
}
